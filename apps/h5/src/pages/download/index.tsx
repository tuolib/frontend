import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import '@/styles/download.scss';

const APK_URL = '/downloads/shop-mall.apk';

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function DownloadPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isAndroid()) setPlatform('android');
    else if (isIOS()) setPlatform('ios');
  }, []);

  function handleDownload() {
    setDownloading(true);
    // Direct link download
    const a = document.createElement('a');
    a.href = APK_URL;
    a.download = 'ShopMall.apk';
    a.click();
    setTimeout(() => setDownloading(false), 2000);
  }

  return (
    <div className="download-page">
      {/* Header */}
      <div className="download-header">
        <div className="download-header-inner">
          <button type="button" className="download-back" onClick={() => navigate(-1)}>
            <span className="i-carbon-arrow-left w-20 h-20 text-white" />
          </button>
          <span className="i-carbon-shopping-bag w-28 h-28 text-[#ff9900]" />
          <span className="text-18 font-700 text-white tracking-[0.02em]">
            Shop<span className="text-[#ff9900]">Mall</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="download-hero">
        <div className="download-app-icon">
          <span className="i-carbon-shopping-bag w-48 h-48 text-[#ff9900]" />
        </div>
        <h1 className="text-24 font-700 text-[#0f1111] mt-16">ShopMall</h1>
        <p className="text-13 text-[#565959] mt-4">畅享品质购物体验</p>
        <div className="download-badges">
          <span className="download-badge">v1.0.0</span>
          <span className="download-badge">Android</span>
          <span className="download-badge">免费</span>
        </div>
      </div>

      {/* Download Button */}
      <div className="download-action">
        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          <span className="i-carbon-download w-20 h-20" />
          <span>{downloading ? '下载中...' : '下载 Android 版'}</span>
        </button>

        <p className="text-11 text-[#999] mt-12 text-center">
          安装前请允许"未知来源"应用安装
        </p>

        {platform === 'ios' && (
          <div className="download-ios-tip">
            <span className="i-carbon-information w-18 h-18 text-[#007185] shrink-0" />
            <p className="text-13 text-[#565959]">
              iOS 版本暂未上架，请使用浏览器访问
              <a href="/" className="text-[#007185] ml-4">网页版</a>
            </p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="download-features">
        <h2 className="text-16 font-600 text-[#0f1111] mb-16">应用特色</h2>
        <div className="download-feature-grid">
          <FeatureCard
            icon="i-carbon-catalog"
            title="海量商品"
            desc="精选品质商品，分类齐全"
          />
          <FeatureCard
            icon="i-carbon-delivery-truck"
            title="极速配送"
            desc="下单即发，快速到达"
          />
          <FeatureCard
            icon="i-carbon-security"
            title="安全支付"
            desc="多重保障，放心交易"
          />
          <FeatureCard
            icon="i-carbon-star"
            title="正品保证"
            desc="品牌直供，假一赔十"
          />
        </div>
      </div>

      {/* Screenshots */}
      <div className="download-screenshots">
        <h2 className="text-16 font-600 text-[#0f1111] mb-16">应用截图</h2>
        <div className="download-screenshot-scroll">
          <ScreenshotPlaceholder label="首页" />
          <ScreenshotPlaceholder label="商品详情" />
          <ScreenshotPlaceholder label="购物车" />
          <ScreenshotPlaceholder label="分类" />
        </div>
      </div>

      {/* Install Guide */}
      <div className="download-guide">
        <h2 className="text-16 font-600 text-[#0f1111] mb-16">安装指南</h2>
        <div className="download-steps">
          <Step num={1} text="点击上方下载按钮，获取安装包" />
          <Step num={2} text="下载完成后，打开 APK 文件" />
          <Step num={3} text={'如提示安全风险，请选择"仍然安装"'} />
          <Step num={4} text="安装完成，开始购物之旅" />
        </div>
      </div>

      {/* Footer */}
      <div className="download-footer">
        <p>© 2026 ShopMall · 保留所有权利</p>
        <a href="/" className="text-[#007185] text-12 mt-8 inline-block">
          继续使用网页版 →
        </a>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="download-feature-card">
      <span className={`${icon} w-28 h-28 text-[#007185]`} />
      <h3 className="text-14 font-600 text-[#0f1111] mt-8">{title}</h3>
      <p className="text-11 text-[#565959] mt-4">{desc}</p>
    </div>
  );
}

function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <div className="download-screenshot-item">
      <div className="download-screenshot-mock">
        <span className="i-carbon-mobile w-32 h-32 text-[#ccc]" />
        <span className="text-12 text-[#999] mt-4">{label}</span>
      </div>
    </div>
  );
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div className="download-step">
      <div className="download-step-num">{num}</div>
      <p className="text-13 text-[#333]">{text}</p>
    </div>
  );
}
