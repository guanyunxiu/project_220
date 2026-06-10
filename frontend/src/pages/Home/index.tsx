import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Button, Card, Tag, Tabs, Row, Col, Divider, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  FireOutlined,
  StarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import WorkCard, { Work } from '../../components/WorkCard';

const banners = [
  {
    id: 1,
    title: '星辰大海',
    subtitle: '一部关于宇宙与命运的史诗巨作',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=400&fit=crop',
    link: '/work/1',
  },
  {
    id: 2,
    title: '独家签约 | 新人扶持计划',
    subtitle: '万元签约奖金 + 全渠道推荐 等你来拿',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop',
    link: '/about/signup',
    color: 'from-orange-500 to-pink-500',
  },
  {
    id: 3,
    title: '年度精品',
    subtitle: '2024年度最受欢迎作品合集',
    image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&h=400&fit=crop',
    link: '/ranking',
  },
];

const mockWorks: Work[] = [
  {
    id: 1,
    title: '诸天万界：开局签到混沌体',
    cover: 'https://picsum.photos/seed/book1/300/400',
    author: '辰东',
    category: '玄幻奇幻',
    tags: ['爽文', '穿越', '系统'],
    status: 'ongoing',
    rating: 9.2,
    views: 1250000,
    likes: 89000,
    favorites: 45000,
    words: 1580000,
    lastChapter: '第528章 混沌神雷，万法皆空',
    updatedAt: new Date().toISOString(),
    description: '穿越异界，开局签到混沌体，从此开启无敌之路！',
  },
  {
    id: 2,
    title: '重生之都市修仙者',
    cover: 'https://picsum.photos/seed/book2/300/400',
    author: '会说话的肘子',
    category: '都市言情',
    tags: ['重生', '都市', '修仙'],
    status: 'ongoing',
    rating: 8.8,
    views: 980000,
    likes: 72000,
    favorites: 38000,
    words: 1250000,
    lastChapter: '第385章 终见故人',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: '剑来',
    cover: 'https://picsum.photos/seed/book3/300/400',
    author: '烽火戏诸侯',
    category: '武侠仙侠',
    tags: ['仙侠', '热血', '经典'],
    status: 'completed',
    rating: 9.8,
    views: 5680000,
    likes: 420000,
    favorites: 280000,
    words: 5800000,
    lastChapter: '第1000章 收官',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: '末日：我的异能能升级',
    cover: 'https://picsum.photos/seed/book4/300/400',
    author: '我吃西红柿',
    category: '科幻游戏',
    tags: ['末日', '异能', '升级'],
    status: 'ongoing',
    rating: 8.5,
    views: 680000,
    likes: 45000,
    favorites: 22000,
    words: 980000,
    lastChapter: '第256章 九级觉醒',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: '刑侦档案',
    cover: 'https://picsum.photos/seed/book5/300/400',
    author: '法医秦明',
    category: '悬疑灵异',
    tags: ['悬疑', '推理', '刑侦'],
    status: 'ongoing',
    rating: 9.1,
    views: 520000,
    likes: 68000,
    favorites: 32000,
    words: 720000,
    lastChapter: '第128章 真相浮出水面',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: '三国：开局截胡大耳贼',
    cover: 'https://picsum.photos/seed/book6/300/400',
    author: '庄不周',
    category: '历史军事',
    tags: ['三国', '历史', '穿越'],
    status: 'ongoing',
    rating: 8.9,
    views: 720000,
    likes: 58000,
    favorites: 28000,
    words: 1120000,
    lastChapter: '第456章 官渡之战',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: '原神之我是执行官',
    cover: 'https://picsum.photos/seed/book7/300/400',
    author: '米哈游',
    category: '二次元',
    tags: ['原神', '同人', '轻松'],
    status: 'ongoing',
    rating: 8.6,
    views: 450000,
    likes: 38000,
    favorites: 18000,
    words: 560000,
    lastChapter: '第89章 至冬的女王',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    title: '鬼灭之刃：最强柱',
    cover: 'https://picsum.photos/seed/book8/300/400',
    author: '吾峠呼世晴',
    category: '同人衍生',
    tags: ['鬼灭', '热血', '同人'],
    status: 'completed',
    rating: 9.0,
    views: 380000,
    likes: 32000,
    favorites: 15000,
    words: 420000,
    lastChapter: '最终章 黎明',
    updatedAt: new Date().toISOString(),
  },
];

const hotRanking = mockWorks.slice(0, 5);
const newWorks = mockWorks.slice(3, 8);
const completedWorks = mockWorks.filter((w) => w.status === 'completed');

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hot');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="h-[220px] md:h-[320px] lg:h-[400px]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link to={banner.link} className="block relative h-full group">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-md">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-sm md:text-lg text-gray-200 mb-4 md:mb-6 line-clamp-2">
                    {banner.subtitle}
                  </p>
                  <Button type="primary" size="large" className="!bg-primary-500">
                    立即查看
                    <ArrowRightOutlined />
                  </Button>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-orange-400 rounded-full" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FireOutlined className="text-red-500" />
                  热门榜
                </h2>
              </div>
              <Link
                to="/ranking"
                className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1 transition-colors"
              >
                查看全部 <ArrowRightOutlined />
              </Link>
            </div>
            <Skeleton loading={loading} active paragraph={{ rows: 4 }}>
              <Row gutter={[16, 16]}>
                {mockWorks.slice(0, 4).map((work) => (
                  <Col xs={12} sm={8} md={6} key={work.id}>
                    <WorkCard work={work} />
                  </Col>
                ))}
              </Row>
            </Skeleton>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-400 rounded-full" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <RocketOutlined className="text-green-500" />
                  新作推荐
                </h2>
              </div>
              <Link
                to="/ranking?type=new"
                className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1 transition-colors"
              >
                查看全部 <ArrowRightOutlined />
              </Link>
            </div>
            <div className="space-y-4">
              {newWorks.slice(0, 3).map((work) => (
                <WorkCard key={work.id} work={work} variant="horizontal" />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  精品完结
                </h2>
              </div>
              <Link
                to="/category?status=completed"
                className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1 transition-colors"
              >
                查看全部 <ArrowRightOutlined />
              </Link>
            </div>
            <Row gutter={[16, 16]}>
              {completedWorks.concat(mockWorks.slice(0, 4 - completedWorks.length)).map((work) => (
                <Col xs={12} sm={8} md={6} key={work.id}>
                  <WorkCard work={{ ...work, status: 'completed' }} />
                </Col>
              ))}
            </Row>
          </section>
        </div>

        <div className="space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-500" />
                <span className="font-semibold">榜单排行</span>
              </div>
            }
            className="!rounded-2xl"
            styles={{ body: { padding: 0 } }}
            tabBarExtraContent={
              <Link to="/ranking" className="text-xs text-gray-400 hover:text-primary-500">
                更多
              </Link>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'hot',
                  label: '热门榜',
                  children: (
                    <div className="p-4">
                      {hotRanking.map((work, index) => (
                        <Link
                          to={`/work/${work.id}`}
                          key={work.id}
                          className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 group"
                        >
                          <span
                            className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs font-bold ${
                              index === 0
                                ? 'bg-red-500 text-white'
                                : index === 1
                                ? 'bg-orange-400 text-white'
                                : index === 2
                                ? 'bg-yellow-400 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate group-hover:text-primary-500 transition-colors">
                              {work.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{work.author}</div>
                          </div>
                          <div className="shrink-0 text-xs text-gray-400 flex items-center gap-1">
                            <EyeOutlined />
                            {(work.views / 10000).toFixed(1)}万
                          </div>
                        </Link>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'new',
                  label: '新书榜',
                  children: (
                    <div className="p-4">
                      {newWorks.slice(0, 5).map((work, index) => (
                        <Link
                          to={`/work/${work.id}`}
                          key={work.id}
                          className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 group"
                        >
                          <span
                            className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs font-bold ${
                              index === 0
                                ? 'bg-red-500 text-white'
                                : index === 1
                                ? 'bg-orange-400 text-white'
                                : index === 2
                                ? 'bg-yellow-400 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate group-hover:text-primary-500 transition-colors">
                              {work.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{work.author}</div>
                          </div>
                          <Tag color="processing" className="!text-xs">
                            新作
                          </Tag>
                        </Link>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'reward',
                  label: '打赏榜',
                  children: (
                    <div className="p-4">
                      {mockWorks.slice(0, 5).map((work, index) => (
                        <Link
                          to={`/work/${work.id}`}
                          key={work.id}
                          className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 group"
                        >
                          <span
                            className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs font-bold ${
                              index === 0
                                ? 'bg-red-500 text-white'
                                : index === 1
                                ? 'bg-orange-400 text-white'
                                : index === 2
                                ? 'bg-yellow-400 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate group-hover:text-primary-500 transition-colors">
                              {work.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <StarOutlined />
                              累计{(work.favorites / 1000).toFixed(1)}万打赏
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <Tag color="gold" className="!text-sm !m-0">
                  VIP
                </Tag>
                <span className="font-semibold">限时活动</span>
              </div>
            }
            className="!rounded-2xl overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <div className="bg-gradient-to-br from-primary-500 via-orange-500 to-pink-500 p-6 text-white">
              <div className="text-2xl font-bold mb-2">新人专享福利</div>
              <div className="text-sm opacity-90 mb-4">注册即送7天VIP + 1000墨币</div>
              <Button type="primary" size="large" className="!bg-white !text-primary-600 w-full !font-semibold">
                立即领取
              </Button>
            </div>
            <Divider className="!m-0" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">月度订阅</span>
                <span className="text-primary-500 font-bold">¥15.9/月</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">年度订阅</span>
                <div>
                  <span className="text-primary-500 font-bold">¥158/年</span>
                  <Tag color="red" className="!ml-2 !text-xs">
                    省33%
                  </Tag>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title={<span className="font-semibold flex items-center gap-2">友情链接</span>}
            className="!rounded-2xl"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex flex-wrap gap-2">
              {['起点中文网', '晋江文学', '番茄小说', '刺猬猫', 'SF轻小说', '哔哩哔哩漫画'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-primary-50 hover:text-primary-500 text-gray-600 rounded-full transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
