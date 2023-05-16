import { loadEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import legacy from "@vitejs/plugin-legacy";
import components from "unplugin-vue-components/vite";
import autoImport from "unplugin-auto-import/vite";
import icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import unocss from "unocss/vite";
import { ElementUiResolver } from "unplugin-vue-components/resolvers";
import { viteMockServe } from "vite-plugin-mock";
import { fileURLToPath } from "url";
import { FileSystemIconLoader } from "unplugin-icons/loaders";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, "./");
  return {
    server: {
      host: true,
      proxy: {
        [env.VITE_API_URL]: {
          target: env.VITE_PROXY,
          changeOrigin: true,
          rewrite: (path: string) =>
            path.replace(new RegExp(`^${env.VITE_API_URL}`), ""),
        },
      },
    },
    define: {
      "process.env": env,
    },
    plugins: [
      vue(),
      unocss(),
      viteMockServe({
        mockPath: "mock",
        localEnabled: command === "serve",
        prodEnabled: false,
        injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `,
      }),
      legacy({
        targets: ["defaults", "ie >= 9"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      }),
      components({
        resolvers: [
          ElementUiResolver(),
          IconsResolver({
            customCollections: ["custom"],
          }),
        ],
        types: [{ from: "vue-router", names: ["RouterLink", "RouterView"] }],
        dts: "./typings/components.d.ts",
      }),
      autoImport({
        dts: "./typings/auto-imports.d.ts",
        imports: ["vue", "pinia", "@vueuse/core", 'vue-router/composables'],
        eslintrc: {
          enabled: true,
        },
      }),
      icons({
        autoInstall: true,
        compiler: "vue3",
        customCollections: {
          custom: FileSystemIconLoader(
            fileURLToPath(new URL("./src/assets/svg", import.meta.url))
          ),
        },
      }),
    ],
    esbuild: {
      drop: command === "build" ? ["console", "debugger"] : [],
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
