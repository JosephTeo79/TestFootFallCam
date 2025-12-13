// 动态加载浮动客服组件
(function() {
  const placeholder = document.createElement('div');
  placeholder.id = 'widget-placeholder';
  document.body.appendChild(placeholder);

  fetch('components/floating-widget.html')
    .then(res => res.text())
    .then(html => {
      placeholder.innerHTML = html;

      // 加载 CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'components/floating-widget.css';
      document.head.appendChild(link);

      // 加载 JS
      const script = document.createElement('script');
      script.src = 'components/floating-widget.js';
      document.body.appendChild(script);
    });
})();
