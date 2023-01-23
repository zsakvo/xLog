// @ts-check
const pkg = require("./package.json")
const spawn = require("cross-spawn")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const execSync = require("child_process").execSync
const withPWA = require("next-pwa")({
  dest: "public",
})

const lastCommitCommand = "git rev-parse HEAD"

class UnoCSS {
  /**
   *
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise("unocss", async () => {
      if (globalThis.uno_built) return
      globalThis.uno_watching = true
      spawn.sync("pnpm", ["uno-generate"], { stdio: "inherit" })
    })
    compiler.hooks.watchRun.tap("unocss", () => {
      if (globalThis.uno_watching) return
      globalThis.uno_watching = true
      spawn("pnpm", ["uno-generate", "--watch"], { stdio: "inherit" })
    })
  }
}

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer(
  withPWA({
    env: {
      APP_DESCRIPTION: pkg.description,
    },
    experimental: {
      scrollRestoration: true,
    },
    output: "standalone",
    productionBrowserSourceMaps: true,

    webpack(config) {
      config.plugins.push(new UnoCSS())
      return config
    },

    images: {
      dangerouslyAllowSVG: true,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
      remotePatterns: [{ hostname: "**" }],
    },

    async generateBuildId() {
      return execSync(lastCommitCommand).toString().trim()
    },

    serverRuntimeConfig: {
      ENV_REDIS_URL: process.env.REDIS_URL,
      ENV_REDIS_EXPIRE: process.env.REDIS_EXPIRE,
      ENV_REDIS_REFRESH: process.env.REDIS_REFRESH,
      ENV_MORALIS_WEB3_API_KEY: process.env.MORALIS_WEB3_API_KEY,
      ENV_ALCHEMY_ETHEREUM_API_KEY: process.env.ALCHEMY_ETHEREUM_API_KEY,
      ENV_ALCHEMY_POLYGON_API_KEY: process.env.ALCHEMY_POLYGON_API_KEY,
      ENV_NFTSCAN_API_KEY: process.env.NFTSCAN_API_KEY,
      ENV_OPENSEA_API_KEY: process.env.OPENSEA_API_KEY,
      ENV_POAP_API_KEY: process.env.POAP_API_KEY,
    },

    pwa: {
      publicExcludes: ["*"],
    },
  }),
)
