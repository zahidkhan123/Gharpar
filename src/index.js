import "./assets/css/vendor/bootstrap.min.css";
import "./assets/css/vendor/bootstrap.rtl.only.min.css";
import "react-circular-progressbar/dist/styles.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-table/react-table.css";
import 'react-image-lightbox/style.css';
import "video.js/dist/video-js.css";
import { i18n } from 'element-react'
import locale from 'element-react/src/locale/lang/en'
import 'element-theme-default';

import { isMultiColorActive, defaultColor,themeColorStorageKey,isDarkSwitchActive } from "./constants/defaultValues";

i18n.use(locale);
const color =
  (isMultiColorActive||isDarkSwitchActive ) && localStorage.getItem(themeColorStorageKey)
    ? localStorage.getItem(themeColorStorageKey)
    : defaultColor;

localStorage.setItem(themeColorStorageKey, color);

let render = () => {
  import('./assets/css/sass/themes/gogo.' + color + '.scss').then(x => {
     require('./AppRenderer');
  });
};
render();