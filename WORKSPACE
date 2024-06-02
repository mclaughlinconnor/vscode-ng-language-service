load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_js",
    sha256 = "5af82fe13fecb467e9c2c19765a593de2e1976afd0a1e18a80d930a2465508fc",
    strip_prefix = "rules_js-1.33.2",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.33.2/rules_js-v1.33.2.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

http_archive(
    name = "aspect_rules_ts",
    sha256 = "4c3f34fff9f96ffc9c26635d8235a32a23a6797324486c7d23c1dfa477e8b451",
    strip_prefix = "rules_ts-1.4.5",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v1.4.5/rules_ts-v1.4.5.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

# TODO: should use version from package.json but this version isn't yet supported by aspect/rules_ts
# rules_ts_dependencies(ts_version_from = "//:package.json")
rules_ts_dependencies(
    ts_version = "5.2.2",
    ts_integrity = "sha512-mI4WrpHsbCIcwT9cF4FZvr80QUeKvsUsUvKDoR+X/7XHQH98xYD8YHZg7ANtz2GtZt/CBq2QJ0thkGJMHfqc1w==",
)

http_archive(
    name = "aspect_rules_jasmine",
    sha256 = "b3b2ff30ed222db653092d8280e0b62a4d54c5e65c598df09a0a1d7aae78fc8f",
    strip_prefix = "rules_jasmine-0.3.1",
    url = "https://github.com/aspect-build/rules_jasmine/releases/download/v0.3.1/rules_jasmine-v0.3.1.tar.gz",
)

load("@aspect_rules_jasmine//jasmine:dependencies.bzl", "rules_jasmine_dependencies")

rules_jasmine_dependencies()

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "c78d38d6ec2e7497dde4f8d67f49c71614daf11e2bbe276e23f5b09a89801677",
    strip_prefix = "rules_esbuild-0.14.1",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.14.1/rules_esbuild-v0.14.1.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_jasmine//jasmine:repositories.bzl", "jasmine_repositories")

jasmine_repositories(name = "jasmine")

load("@jasmine//:npm_repositories.bzl", jasmine_npm_repositories = "npm_repositories")

jasmine_npm_repositories()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "esbuild_register_toolchains", ESBUILD_LATEST_VERSION = "LATEST_VERSION")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = ESBUILD_LATEST_VERSION,
)

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    node_repositories = {
        "20.8.0-darwin_amd64": ("node-v20.8.0-darwin-x64.tar.gz", "node-v20.8.0-darwin-x64", "a6f6b573ea656c149956f69f35e04ebb242b945d59972bea2e96a944bbf50ad1"),
        "20.8.0-linux_amd64": ("node-v20.8.0-linux-x64.tar.xz", "node-v20.8.0-linux-x64", "66056a2acc368db142b8a9258d0539e18538ae832b3ccb316671b0d35cb7c72c"),
        "20.8.0-windows_amd64": ("node-v20.8.0-win-x64.zip", "node-v20.8.0-win-x64", "6afd5a7aa126f4e255f041de66c4a608f594190d34dcaba72f7b348d2410ca66"),
    },
    name = "nodejs",
    node_version = "18.13.0",
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    bins = {
        "@electron/rebuild": {
            "electron-rebuild": "lib/cli.js",
        },
    },
    data = [
        "//:package.json",
        "//:pnpm-workspace.yaml",
        # PLACE_HOLDER_FOR_angular/angular_packages/language-service/build.sh
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    # Hoist transitive closure of npm deps needed for vsce; this set was determined manually by
    # running `bazel build //:vsix` and burning down missing packages. We do this so that we
    # don't have to run an additional `npm install` action to create a node_modules within the
    # //:npm npm_package where the vsce build takes place.
    public_hoist_packages = {
        "npx@10.2.2": [""],
        "@electron/rebuild@^3.3.0": [""],
        "@isaacs/cliui@^8.0.2": [""],
        "@malept/cross-spawn-promise@^2.0.0": [""],
        "@sindresorhus/is@^4.0.0": [""],
        "@szmarczak/http-timer@^4.0.5": [""],
        "@tootallnate/once@2": [""],
        "@types/cacheable-request@^6.0.1": [""],
        "@types/http-cache-semantics@^": [""],
        "@types/keyv@^3.1.4": [""],
        "@types/responselike@^1.0.0": [""],
        "abbrev@^1.0.0": [""],
        "agent-base@6": [""],
        "agentkeepalive@^4.2.1": [""],
        "aggregate-error@^3.0.0": [""],
        "ansi-styles@^4.0.0": [""],
        "aproba@^1.0.3 || ^2.0.0": [""],
        "are-we-there-yet@^3.0.0": [""],
        "balanced-match@^1.0.0": [""],
        "base64-js@^1.3.1": [""],
        "bl@^4.0.3": [""],
        "brace-expansion@^1.1.7": [""],
        "brace-expansion@^2.0.1": [""],
        "buffer@^5.5.0": [""],
        "cacheable-lookup@^5.0.3": [""],
        "cacheable-request@^7.0.2": [""],
        "chalk@^4.0.0": [""],
        "chownr@^2.0.0": [""],
        "clean-stack@^2.0.0": [""],
        "cli-cursor@^3.1.0": [""],
        "cli-spinners@^2.5.0": [""],
        "clone-response@^1.0.2": [""],
        "clone@^1.0.2": [""],
        "color-support@^1.1.3": [""],
        "concat-map@^0.0.1": [""],
        "console-control-strings@^1.1.0": [""],
        "cross-spawn@^7.0.0": [""],
        "debug@^4.3.3": [""],
        "decompress-response@^6.0.0": [""],
        "deep-extend@^0.6.0": [""],
        "defaults@^1.0.3": [""],
        "defer-to-connect@^2.0.0": [""],
        "delegates@^1.0.0": [""],
        "detect-libc@^2.0.0": [""],
        "eastasianwidth@^0.2.0": [""],
        "emoji-regex@^8.0.0": [""],
        "end-of-stream@^1.1.0": [""],
        "env-paths@^2.2.0": [""],
        "err-code@^2.0.2": [""],
        "escalade@^3.1.1": [""],
        "expand-template@^2.0.3": [""],
        "exponential-backoff@^3.1.1": [""],
        "foreground-child@^3.1.0": [""],
        "fs-constants@^1.0.0": [""],
        "fs-extra@^10.0.0": [""],
        "fs.realpath@^1.0.0": [""],
        "gauge@^4.0.3": [""],
        "get-caller-file@^2.0.5": [""],
        "github-from-package@^0.0.0": [""],
        "glob@^7.1.4": [""],
        "got@^11.7.0": [""],
        "graceful-fs@^4.2.6": [""],
        "has-flag@^4.0.0": [""],
        "has-unicode@^2.0.1": [""],
        "http-cache-semantics@^4.1.1": [""],
        "http-proxy-agent@^5.0.0": [""],
        "http2-wrapper@^1.0.0-beta.5.2": [""],
        "https-proxy-agent@^5.0.0": [""],
        "humanize-ms@^1.2.1": [""],
        "ieee754@^1.1.13": [""],
        "imurmurhash@^0.1.4": [""],
        "indent-string@^4.0.0": [""],
        "inflight@^1.0.4": [""],
        "inherits@2": [""],
        "ini@~1.3.0": [""],
        "ip@^2.0.0": [""],
        "is-fullwidth-code-point@^3.0.0": [""],
        "is-interactive@^1.0.0": [""],
        "is-lambda@^1.0.1": [""],
        "is-unicode-supported@^0.1.0": [""],
        "isexe@^2.0.0": [""],
        "jackspeak@^2.3.5": [""],
        "json-buffer@3.0.1": [""],
        "json-buffer@^3.0.1": [""],
        "jsonfile@^4.0.0": [""],
        "keyv@^4.0.0": [""],
        "log-symbols@^4.1.0": [""],
        "lowercase-keys@^2.0.0": [""],
        "lru-cache@6.0.0": [""],
        "make-fetch-happen@11.0.3": [""],
        "mimic-fn@^2.1.0": [""],
        "mimic-response@^3.1.0": [""],
        "minimatch@^3.1.2": [""],
        "minimatch@^9.0.3": [""],
        "minimist@^1.2.0": [""],
        "minipass-collect@^1.0.2": [""],
        "minipass-fetch@^3.0.0": [""],
        "minipass-flush@^1.0.5": [""],
        "minipass-pipeline@^1.2.4": [""],
        "minipass-sized@^1.0.3": [""],
        "minipass@^3.0.0": [""],
        "minizlib@^2.1.1": [""],
        "mkdirp-classic@^0.5.3": [""],
        "mkdirp@^1.0.3": [""],
        "nan@^2.14.1": [""],
        "nan@^2.17.0": [""],
        "napi-build-utils@^1.0.1": [""],
        "negotiator@^0.6.3": [""],
        "node-abi@^3.3.0": [""],
        "node-api-version@^0.1.4": [""],
        "node-gyp@9.4.0": [""],
        "nopt@6.0.0": [""],
        "normalize-url@^6.0.1": [""],
        "npmlog@6.0.0": [""],
        # "npmlog@4.1.2": [""],
        "once@^1.3.0": [""],
        "onetime@^5.1.0": [""],
        "ora@^5.1.0": [""],
        "p-cancelable@^2.0.0": [""],
        "p-map@^4.0.0": [""],
        "path-is-absolute@^1.0.0": [""],
        "path-key@^3.1.0": [""],
        "path-scurry@^1.10.1": [""],
        "prebuild-install@^7.1.1": [""],
        "pug_html_locator_js@1.0.39": [""],
        "pump@^3.0.0": [""],
        "quick-lru@^5.1.1": [""],
        "rc@^1.2.7": [""],
        "require-directory@^2.1.1": [""],
        "resolve-alpn@^1.0.0": [""],
        "responselike@^2.0.0": [""],
        "restore-cursor@^3.1.0": [""],
        "rimraf@3.0.2": [""],
        "safe-buffer@^5.0.1": [""],
        "safe-buffer@~5.2.0": [""],
        "semver@7.3.7": [""],
        "set-blocking@^2.0.0": [""],
        "signal-exit@^3.0.7": [""],
        "simple-concat@^1.0.0": [""],
        "simple-get@^4.0.0": [""],
        "smart-buffer@^4.2.0": [""],
        "socks-proxy-agent@^7.0.0": [""],
        "socks@^2.6.2": [""],
        "string-width-cjs@npm:string-width@^4.2.0": [""],
        "string-width@^4.1.0": [""],
        "strip-ansi-cjs@npm:strip-ansi@^6.0.1": [""],
        "strip-ansi@^6.0.0": [""],
        "tree-sitter-pug@1.0.1": [""],
        "tree-sitter@0.20.5": [""],
        "tunnel-agent@^0.6.0": [""],
        "universalify@^2.0.0": [""],
        "util-deprecate@^1.0.1": [""],
        "vscode-languageserver-types@3.16.0": [""],
        "vscode-nls@5.2.0": [""],
        "wcwidth@^1.0.1": [""],
        "which@2.0.2": [""],
        "wide-align@^1.1.5": [""],
        "wrap-ansi-cjs@npm:wrap-ansi@^7.0.0": [""],
        "wrap-ansi@^7.0.0": [""],
        "wrappy@1": [""],
        "yallist@4.0.0": [""],
        "yargs@^17.0.1": [""],

        "@bazel/bazelisk@1.12.0": [""],
        "@bazel/ibazel@0.16.2": [""],
        "@types/jasmine@3.10.7": [""],
        "@types/node@14.18.33": [""],
        "@types/vscode@1.67.0": [""],
        "clang-format@1.8.0": [""],
        "cross-env@^7.0.3": [""],
        "esbuild@0.14.39": [""],
        "jasmine@3.99.0": [""],
        "prettier@2.7.1": [""],
        "rxjs@6.6.7": [""],
        "ts-node@^10.8.1": [""],
        "tslint-eslint-rules@5.4.0": [""],
        "tslint@6.1.3": [""],
        "vsce@1.100.1": [""],
        "vscode-test@1.6.1": [""],
        "vscode-tmgrammar-test@0.0.11": [""],

        "readable-stream@^2.3.0": [""],
        "es6-promisify@^5.0.0": [""],
        "readable-stream@^2.3.5": [""],
        "readable-stream@^2.0.6": [""],

        "core-util-is@~1.0.0": [""],
        "process-nextick-args@~2.0.0": [""],
        "string_decoder@~1.1.1": [""],

        "guage@4.0.4": [""],

        "tar@^6.0.5": [""],
        "shebang-regex@^3.0.0": [""],
        "fs-minipass@^2.0.0": [""],

    },
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//:yarn.lock",
    # PLACE_HOLDER_FOR_packages/language-service/build.sh_IN_angular_REPO
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()

npm_translate_lock(
    name = "npm_integration_workspace",
    data = [
        "//integration/workspace:package.json",
        "//integration/workspace:pnpm-workspace.yaml",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//integration/workspace:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//integration/workspace:yarn.lock",
)

load("@npm_integration_workspace//:repositories.bzl", npm_integration_workspace_repositories = "npm_repositories")

npm_integration_workspace_repositories()

npm_translate_lock(
    name = "npm_integration_pre_apf_project",
    data = [
        "//integration/pre_apf_project:package.json",
        "//integration/pre_apf_project:pnpm-workspace.yaml",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//integration/pre_apf_project:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//integration/pre_apf_project:yarn.lock",
)

load("@npm_integration_pre_apf_project//:repositories.bzl", npm_integration_pre_apf_project_repositories = "npm_repositories")

npm_integration_pre_apf_project_repositories()

npm_translate_lock(
    name = "npm_integration_project",
    data = [
        "//integration/project:package.json",
        "//integration/project:pnpm-workspace.yaml",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//integration/project:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//integration/project:yarn.lock",
)

load("@npm_integration_project//:repositories.bzl", npm_integration_project_repositories = "npm_repositories")

npm_integration_project_repositories()
