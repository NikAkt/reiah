import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
  ],
  server: {
    host: "0.0.0.0",
    hmr: {
      clientPort: 3000
    },
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  build: {
    target: 'esnext',
  },
});
// export default (conf: any) => {
//   return defineConfig({
//     server: {
//       host: "0.0.0.0",
//       hmr: {
//         clientPort: ENV_VARIABLES.OUTER_PORT_FRONTEND,
//       },
//       port: ENV_VARIABLES.INNER_PORT_FRONTEND_DEV, 
//       watch: {
//         usePolling: true,
//       },
//     },
//   });
// };
