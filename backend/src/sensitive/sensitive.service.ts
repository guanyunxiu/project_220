import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class FilterTextDto {
  @ApiProperty({ description: '待过滤文本' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;
}

export class AddWordsDto {
  @ApiProperty({ description: '敏感词列表' })
  @IsArray()
  @IsString({ each: true })
  words: string[];
}

export class RemoveWordsDto {
  @ApiProperty({ description: '要移除的敏感词列表' })
  @IsArray()
  @IsString({ each: true })
  words: string[];
}

export interface FilterResult {
  original: string;
  filtered: string;
  hasSensitive: boolean;
  matchedWords: string[];
  matchCount: number;
}

interface DFAState {
  transitions: Map<string, DFAState>;
  isEnd: boolean;
}

@Injectable()
export class SensitiveService {
  private readonly logger = new Logger(SensitiveService.name);
  private root: DFAState = { transitions: new Map(), isEnd: false };
  private sensitiveWords: Set<string> = new Set();

  constructor() {
    this.initializeDefaultWords();
  }

  private initializeDefaultWords(): void {
    const defaults: string[] = [];

    const political = [];

    const violent = [
      '杀人', '放火', '抢劫', '强奸', '爆炸', '恐怖', '袭击', '暗杀',
      '绑架', '勒索', '贩毒', '走私', '洗钱',
    ];

    const pornographic = [
      '色情', '淫', '嫖', '妓', '娼', '性交', '裸聊', '裸体', '裸露',
      '性服务', '成人影片', 'AV',
    ];

    const gambling = [
      '赌博', '赌场', '赌球', '赌马', '百家乐', '老虎机', '六合彩',
      '时时彩', '福利彩票外围',
    ];

    const drugs = [
      '毒品', '大麻', '海洛因', '可卡因', '冰毒', '摇头丸', 'K粉',
      '罂粟', '麻黄碱', '吸毒', '贩毒',
    ];

    const scams = [
      '诈骗', '传销', '非法集资', '庞氏骗局', '套路贷', '高利贷',
      '刷单返利', '虚假投资',
    ];

    const all = [
      ...political,
      ...violent,
      ...pornographic,
      ...gambling,
      ...drugs,
      ...scams,
    ];

    all.forEach((word) => this.addWordInternal(word));
    this.logger.log(`Initialized ${this.sensitiveWords.size} default sensitive words`);
  }

  private addWordInternal(word: string): void {
    if (!word || !word.trim()) return;
    const trimmed = word.trim().toLowerCase();
    if (this.sensitiveWords.has(trimmed)) return;

    this.sensitiveWords.add(trimmed);
    let current = this.root;
    for (const char of trimmed) {
      if (!current.transitions.has(char)) {
        current.transitions.set(char, {
          transitions: new Map(),
          isEnd: false,
        });
      }
      current = current.transitions.get(char)!;
    }
    current.isEnd = true;
  }

  addWords(words: string[]): { added: number; total: number } {
    let added = 0;
    for (const word of words) {
      const before = this.sensitiveWords.size;
      this.addWordInternal(word);
      if (this.sensitiveWords.size > before) {
        added++;
      }
    }
    this.logger.log(`Added ${added} sensitive words, total: ${this.sensitiveWords.size}`);
    return { added, total: this.sensitiveWords.size };
  }

  removeWords(words: string[]): { removed: number; total: number } {
    let removed = 0;
    for (const word of words) {
      const trimmed = word.trim().toLowerCase();
      if (this.sensitiveWords.has(trimmed)) {
        this.sensitiveWords.delete(trimmed);
        removed++;
      }
    }

    if (removed > 0) {
      this.rebuildDFA();
    }

    this.logger.log(`Removed ${removed} sensitive words, total: ${this.sensitiveWords.size}`);
    return { removed, total: this.sensitiveWords.size };
  }

  private rebuildDFA(): void {
    this.root = { transitions: new Map(), isEnd: false };
    const words = Array.from(this.sensitiveWords);
    for (const word of words) {
      let current = this.root;
      for (const char of word) {
        if (!current.transitions.has(char)) {
          current.transitions.set(char, {
            transitions: new Map(),
            isEnd: false,
          });
        }
        current = current.transitions.get(char)!;
      }
      current.isEnd = true;
    }
  }

  filter(text: string): FilterResult {
    if (!text) {
      return {
        original: text || '',
        filtered: text || '',
        hasSensitive: false,
        matchedWords: [],
        matchCount: 0,
      };
    }

    const lowerText = text.toLowerCase();
    const matchedWords: Set<string> = new Set();
    let matchCount = 0;
    const result: string[] = [];
    let i = 0;

    while (i < text.length) {
      let current = this.root;
      let maxMatchLength = 0;
      let matchedWord = '';

      for (let j = i; j < lowerText.length; j++) {
        const char = lowerText[j];
        if (current.transitions.has(char)) {
          current = current.transitions.get(char)!;
          if (current.isEnd) {
            maxMatchLength = j - i + 1;
            matchedWord = text.substring(i, j + 1);
          }
        } else {
          break;
        }
      }

      if (maxMatchLength > 0) {
        matchedWords.add(matchedWord.toLowerCase());
        matchCount++;
        result.push('*'.repeat(maxMatchLength));
        i += maxMatchLength;
      } else {
        result.push(text[i]);
        i++;
      }
    }

    return {
      original: text,
      filtered: result.join(''),
      hasSensitive: matchedWords.size > 0,
      matchedWords: Array.from(matchedWords),
      matchCount,
    };
  }

  containsSensitive(text: string): { hasSensitive: boolean; matchedWords: string[] } {
    const result = this.filter(text);
    return {
      hasSensitive: result.hasSensitive,
      matchedWords: result.matchedWords,
    };
  }

  getAllWords(): { words: string[]; total: number } {
    return {
      words: Array.from(this.sensitiveWords).sort(),
      total: this.sensitiveWords.size,
    };
  }

  clearAll(): { cleared: number } {
    const cleared = this.sensitiveWords.size;
    this.sensitiveWords.clear();
    this.root = { transitions: new Map(), isEnd: false };
    this.logger.log(`Cleared all ${cleared} sensitive words`);
    return { cleared };
  }
}
