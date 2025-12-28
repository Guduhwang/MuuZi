(window._iconfont_svg_string_4881830 =
  '<svg><symbol id="icon-a-23-sousuo" viewBox="0 0 1024 1024"><path d="M507.26 303.79a192.93 192.93 0 0 0-136.87 56.6c-75.47 75.47-75.47 198.27 0 273.74s198.27 75.47 273.74 0 75.46-198.27 0-273.74a192.93 192.93 0 0 0-136.87-56.6z" fill="#2C2C2C" ></path><path d="M512 64C264.58 64 64 264.58 64 512s200.58 448 448 448 448-200.58 448-448S759.42 64 512 64z m302.15 740.15a43 43 0 0 1-60.82 0l-90.52-90.53a266.29 266.29 0 1 1 60.82-60.81l90.52 90.52a43 43 0 0 1 0 60.82z" fill="#2C2C2C" ></path></symbol></svg>'),
  ((n) => {
    var t = (e = (e = document.getElementsByTagName('script'))[e.length - 1]).getAttribute('data-injectcss'),
      e = e.getAttribute('data-disable-injectsvg');
    if (!e) {
      var o,
        i,
        a,
        d,
        s,
        c = function (t, e) {
          e.parentNode.insertBefore(t, e);
        };
      if (t && !n.__iconfont__svg__cssinject__) {
        n.__iconfont__svg__cssinject__ = !0;
        try {
          document.write(
            '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>',
          );
        } catch (t) {
          console && console.log(t);
        }
      }
      (o = function () {
        let t,
          e = document.createElement('div');
        (e.innerHTML = n._iconfont_svg_string_4881830),
          (e = e.getElementsByTagName('svg')[0]) &&
            (e.setAttribute('aria-hidden', 'true'),
            (e.style.position = 'absolute'),
            (e.style.width = 0),
            (e.style.height = 0),
            (e.style.overflow = 'hidden'),
            (e = e),
            (t = document.body).firstChild ? c(e, t.firstChild) : t.appendChild(e));
      }),
        document.addEventListener
          ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
            ? setTimeout(o, 0)
            : ((i = function () {
                document.removeEventListener('DOMContentLoaded', i, !1), o();
              }),
              document.addEventListener('DOMContentLoaded', i, !1))
          : document.attachEvent &&
            ((a = o),
            (d = n.document),
            (s = !1),
            r(),
            (d.onreadystatechange = function () {
              'complete' == d.readyState && ((d.onreadystatechange = null), l());
            }));
    }
    function l() {
      s || ((s = !0), a());
    }
    function r() {
      try {
        d.documentElement.doScroll('left');
      } catch (t) {
        return void setTimeout(r, 50);
      }
      l();
    }
  })(window);
