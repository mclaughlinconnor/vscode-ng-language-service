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
    name = "nodejs",
    node_version = "18.13.0",
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    public_hoist_packages = {
      "@malept/cross-spawn-promise@2.0.0": [""],
      "@npmcli/fs@3.1.1": [""],
      "@sindresorhus/is@4.6.0": [""],
      "@szmarczak/http-timer@4.0.6": [""],
      "@tootallnate/once@2.0.0": [""],
      "@types/cacheable-request@6.0.3": [""],
      "@types/http-cache-semantics@4.0.4": [""],
      "@types/keyv@3.1.4": [""],
      "@types/responselike@1.0.3": [""],
      "abbrev@1.1.1": [""],
      "acorn@7.4.1": [""],
      "agent-base@6.0.2": [""],
      "agentkeepalive@4.6.0": [""],
      "aggregate-error@3.1.0": [""],
      "ansi-regex@5.0.1": [""],
      "ansi-styles@4.3.0": [""],
      "aproba@2.0.0": [""],
      "are-we-there-yet@3.0.1": [""],
      "balanced-match@1.0.2": [""],
      "base64-js@1.5.1": [""],
      "bl@4.1.0": [""],
      "brace-expansion@1.1.12": [""],
      "buffer@5.7.1": [""],
      "cacache@17.1.4": [""],
      "cacheable-lookup@5.0.4": [""],
      "cacheable-request@7.0.2": [""],
      "cacheable-request@7.0.4": [""],
      "call-bind-apply-helpers@1.0.2": [""],
      "call-bound@1.0.4": [""],
      "chalk@4.1.2": [""],
      "character-parser@2.2.0": [""],
      "chownr@2.0.0": [""],
      "clean-stack@2.2.0": [""],
      "cli-cursor@3.1.0": [""],
      "cli-spinners@2.5.0": [""],
      "cli-spinners@2.9.2": [""],
      "cliui@7.0.4": [""],
      "clone-response@1.0.3": [""],
      "clone@1.0.4": [""],
      "color-convert@2.0.1": [""],
      "color-name@1.1.4": [""],
      "color-support@1.1.3": [""],
      "concat-map@0.0.1": [""],
      "console-control-strings@1.1.0": [""],
      "cross-spawn@7.0.6": [""],
      "debug@4.3.7": [""],
      "decompress-response@6.0.0": [""],
      "defaults@1.0.4": [""],
      "defer-to-connect@2.0.1": [""],
      "delegates@1.0.0": [""],
      "detect-libc@2.0.4": [""],
      "dunder-proto@1.0.1": [""],
      "emoji-regex@8.0.0": [""],
      "end-of-stream@1.4.4": [""],
      "env-paths@2.2.1": [""],
      "err-code@2.0.3": [""],
      "es-define-property@1.0.1": [""],
      "es-errors@1.3.0": [""],
      "es-object-atoms@1.1.1": [""],
      "escalade@3.2.0": [""],
      "exponential-backoff@3.1.2": [""],
      "fs-minipass@3.0.3": [""],
      "fs.realpath@1.0.0": [""],
      "function-bind@1.1.2": [""],
      "get-caller-file@2.0.5": [""],
      "get-intrinsic@1.3.0": [""],
      "get-proto@1.0.1": [""],
      "get-stream@5.2.0": [""],
      "glob@8.1.0": [""],
      "gopd@1.2.0": [""],
      "got@11.8.6": [""],
      "graceful-fs@4.2.11": [""],
      "has-flag@4.0.0": [""],
      "has-symbols@1.1.0": [""],
      "has-tostringtag@1.0.2": [""],
      "has-unicode@2.0.1": [""],
      "hasown@2.0.2": [""],
      "http-cache-semantics@4.2.0": [""],
      "http-proxy-agent@5.0.0": [""],
      "http2-wrapper@1.0.3": [""],
      "https-proxy-agent@5.0.1": [""],
      "humanize-ms@1.2.1": [""],
      "ieee754@1.2.1": [""],
      "imurmurhash@0.1.4": [""],
      "indent-string@4.0.0": [""],
      "inflight@1.0.6": [""],
      "inherits@2.0.4": [""],
      "ip-address@9.0.5": [""],
      "is-expression@4.0.0": [""],
      "is-fullwidth-code-point@3.0.0": [""],
      "is-interactive@1.0.0": [""],
      "is-lambda@1.0.1": [""],
      "is-regex@1.2.1": [""],
      "is-unicode-supported@0.1.0": [""],
      "isexe@2.0.0": [""],
      "jsbn@1.1.0": [""],
      "json-buffer@3.0.1": [""],
      "keyv@4.5.4": [""],
      "log-symbols@4.1.0": [""],
      "lowercase-keys@2.0.0": [""],
      "lru-cache@7.18.3": [""],
      "make-fetch-happen@11.1.1": [""],
      "math-intrinsics@1.1.0": [""],
      "mimic-fn@2.1.0": [""],
      "mimic-response@3.1.0": [""],
      "minimatch@3.0.4": [""],
      "minipass-collect@1.0.2": [""],
      "minipass-fetch@3.0.5": [""],
      "minipass-flush@1.0.5": [""],
      "minipass-pipeline@1.2.4": [""],
      "minipass@7.1.2": [""],
      "minizlib@3.0.2": [""],
      "mkdirp@1.0.4": [""],
      "ms@2.1.3": [""],
      "negotiator@0.6.3": [""],
      "node-abi@3.75.0": [""],
      "node-addon-api@8.3.1": [""],
      "node-api-version@0.2.1": [""],
      "node-gyp-build@4.8.4": [""],
      "nopt@6.0.0": [""],
      "normalize-url@6.1.0": [""],
      "object-assign@4.1.1": [""],
      "once@1.4.0": [""],
      "onetime@5.1.2": [""],
      "ora@5.4.1": [""],
      "p-cancelable@2.1.1": [""],
      "p-map@4.0.0": [""],
      "path-key@3.1.1": [""],
      "proc-log@2.0.1": [""],
      "promise-retry@2.0.1": [""],
      "pug-error@2.1.0": [""],
      "pump@3.0.2": [""],
      "quick-lru@5.1.1": [""],
      "read-binary-file-arch@1.0.6": [""],
      "readable-stream@3.6.2": [""],
      "require-directory@2.1.1": [""],
      "resolve-alpn@1.2.1": [""],
      "responselike@2.0.0": [""],
      "responselike@2.0.1": [""],
      "restore-cursor@3.1.0": [""],
      "retry@0.13.1": [""],
      "rimraf@3.0.2": [""],
      "safe-buffer@5.1.2": [""],
      "semver@7.7.2": [""],
      "set-blocking@2.0.0": [""],
      "shebang-command@2.0.0": [""],
      "shebang-regex@3.0.0": [""],
      "signal-exit@3.0.7": [""],
      "smart-buffer@4.2.0": [""],
      "socks-proxy-agent@7.0.0": [""],
      "socks@2.8.4": [""],
      "sprintf-js@1.1.3": [""],
      "ssri@10.0.6": [""],
      "string-width@4.2.3": [""],
      "string_decoder@1.1.1": [""],
      "strip-ansi@6.0.1": [""],
      "supports-color@7.2.0": [""],
      "tar@6.2.1": [""],
      "token-stream@1.0.0": [""],
      "tree-sitter-pug@1.0.12": [""],
      "tree-sitter@0.21.1": [""],
      "undici-types@5.26.5": [""],
      "unique-filename@3.0.0": [""],
      "unique-slug@4.0.0": [""],
      "util-deprecate@1.0.2": [""],
      "vscode-nls@5.2.0": [""],
      "wcwidth@1.0.1": [""],
      "which@2.0.2": [""],
      "wide-align@1.1.5": [""],
      "wrap-ansi@7.0.0": [""],
      "wrappy@1.0.2": [""],
      "y18n@5.0.8": [""],
      "yallist@4.0.0": [""],
      "yargs-parser@20.2.9": [""],
      "yargs@17.1.1": [""],
    },
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
