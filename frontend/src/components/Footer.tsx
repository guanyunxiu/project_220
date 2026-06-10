import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-primary-500">墨染</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              墨染是一个专注于原创文学与漫画的连载平台，为创作者提供展示舞台，为读者带来优质内容。
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">快速导航</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">首页</Link></li>
              <li><Link to="/category" className="hover:text-primary-400 transition-colors">分类浏览</Link></li>
              <li><Link to="/ranking" className="hover:text-primary-400 transition-colors">排行榜</Link></li>
              <li><Link to="/search" className="hover:text-primary-400 transition-colors">搜索</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">创作者中心</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/author/works" className="hover:text-primary-400 transition-colors">作者后台</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">签约申请</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">创作指南</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">收益说明</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>contact@moran.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                <span>官方QQ群：123456789</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span>微信公众号：墨染文学</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 墨染文学 版权所有 | 京ICP备12345678号</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-primary-400">用户协议</a>
            <a href="#" className="hover:text-primary-400">隐私政策</a>
            <a href="#" className="hover:text-primary-400">版权声明</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
