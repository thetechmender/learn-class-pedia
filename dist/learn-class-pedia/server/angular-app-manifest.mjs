
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/course",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OG4NWJ7Z.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OTOGCGRW.js"
    ],
    "route": "/course"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OTOGCGRW.js"
    ],
    "route": "/course/classroom"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OTOGCGRW.js"
    ],
    "route": "/classroom"
  },
  {
    "renderMode": 0,
    "redirectTo": "/course",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 37190, hash: '3af2e6cefd74b6a9888c0af85000b6c8e83512609656b59cf328fa8e6eb3ef4d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 29444, hash: '226d7821be04b0269cf0746710fa76aa380ad2a8dba3b00ffc9f405f987e9bbf', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'course/classroom/index.html': {size: 56534, hash: 'cc9894664c7553cac2e7aa2584dcdc911b357761c5dcd3fcb6766783e1c27a6e', text: () => import('./assets-chunks/course_classroom_index_html.mjs').then(m => m.default)},
    'classroom/index.html': {size: 56534, hash: 'cc9894664c7553cac2e7aa2584dcdc911b357761c5dcd3fcb6766783e1c27a6e', text: () => import('./assets-chunks/classroom_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 50546, hash: '29572b01daa358503c3aec0ac953686576bdca81ef5089f701aae8de944aa4c9', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'course/index.html': {size: 56534, hash: 'cc9894664c7553cac2e7aa2584dcdc911b357761c5dcd3fcb6766783e1c27a6e', text: () => import('./assets-chunks/course_index_html.mjs').then(m => m.default)},
    'styles-CSNFW5ZH.css': {size: 14245, hash: 'LoO4pus4U+8', text: () => import('./assets-chunks/styles-CSNFW5ZH_css.mjs').then(m => m.default)}
  },
};
