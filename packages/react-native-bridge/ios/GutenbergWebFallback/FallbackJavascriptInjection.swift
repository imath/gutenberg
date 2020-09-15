import WebKit

public struct SourceFile {
    enum SourceFileError: Error {
        case sourceFileNotFound(String)
    }

    public enum Extension: String {
        case css
        case js
        case json
    }
    private let name: String
    private let type: Extension
    private let bundle: Bundle

    public init(name: String, type: Extension, bundle: Bundle = Bundle(for: Gutenberg.self)) {
        self.name = name
        self.type = type
        self.bundle = bundle
    }

    func getContent() throws -> String {
        guard let path = bundle.path(forResource: name, ofType: type.rawValue) else {
            throw SourceFileError.sourceFileNotFound("\(name).\(type)")
        }
        return try String(contentsOfFile: path, encoding: .utf8)
    }

    public func jsScript(with argument: String? = nil) throws -> WKUserScript {
        let content = try getContent()
        let formatted = String(format: content, argument ?? [])
        return formatted.toJsScript()
    }
}

extension SourceFile {
    static let editorStyle = SourceFile(name: "editor-style-overrides", type: .css)
    static let wpBarsStyle = SourceFile(name: "wp-bar-override", type: .css)
    static let injectCss = SourceFile(name: "inject-css", type: .js)
    static let retrieveHtml = SourceFile(name: "content-functions", type: .js)
    static let insertBlock = SourceFile(name: "insert-block", type: .js)
    static let localStorage  = SourceFile(name: "local-storage-overrides", type: .json)
    static let preventAutosaves = SourceFile(name: "prevent-autosaves", type: .js)
    static let gutenbergObserver = SourceFile(name: "gutenberg-observer", type: .js)
}

public struct FallbackJavascriptInjection {
    enum JSMessage: String, CaseIterable {
        case htmlPostContent
        case log
        case gutenbergReady
    }

    private let userContentScripts: [WKUserScript]
    private let injectLocalStorageScriptTemplate = "localStorage.setItem('WP_DATA_USER_%@','%@')"
    private let injectCssScriptTemplate = "window.injectCss(`%@`)"

    public let insertBlockScript: WKUserScript
    public let injectWPBarsCssScript: WKUserScript
    public let injectEditorCssScript: WKUserScript
    public let injectCssScript: WKUserScript
    public let injectLocalStorageScript: WKUserScript
    public let preventAutosavesScript: WKUserScript
    public let getHtmlContentScript = "window.getHTMLPostContent()".toJsScript()
    public let gutenbergObserverScript: WKUserScript

    /// Init an instance of GutenbergWebJavascriptInjection or throws if any of the required sources doesn't exist.
    /// This helps to cach early any possible error due to missing source files.
    /// - Parameter blockHTML: The block HTML code to be injected.
    /// - Parameter userId: The id of the logged user.
    /// - Throws: Throws an error if any required source doesn't exist.
    public init(blockHTML: String, userId: String) throws {
        func script(with source: SourceFile, argument: String? = nil) throws -> WKUserScript {
            try source.jsScript(with: argument)
        }

        func getInjectCssScript(with source: SourceFile) throws -> WKUserScript {
            "window.injectCss(`\(try source.getContent())`)".toJsScript()
        }

        userContentScripts = [
            try script(with: .retrieveHtml),
        ]

        insertBlockScript = try script(with: .insertBlock, argument: blockHTML.replacingOccurrences(of: "\\n", with: "\\\\n"))
        injectCssScript = try script(with: .injectCss)
        injectWPBarsCssScript = try getInjectCssScript(with: .wpBarsStyle)
        injectEditorCssScript = try getInjectCssScript(with: .editorStyle)
        preventAutosavesScript = try script(with: .preventAutosaves)
        gutenbergObserverScript = try script(with: .gutenbergObserver)

        let localStorageJsonString = try SourceFile.localStorage.getContent().removingSpacesAndNewLines()
        let scriptString = String(format: injectLocalStorageScriptTemplate, userId, localStorageJsonString)
        injectLocalStorageScript = scriptString.toJsScript()
    }

    func userContent(messageHandler handler: WKScriptMessageHandler, blockHTML: String) -> WKUserContentController {
        let userContent = WKUserContentController()
        userContent.addUserScripts(userContentScripts)
        JSMessage.allCases.forEach {
            userContent.add(handler, name: $0.rawValue)
        }
        return userContent
    }
}

internal extension String {
    func toJsScript() -> WKUserScript {
        WKUserScript(source: self, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
    }

    func removingSpacesAndNewLines() -> String {
        return replacingOccurrences(of: "\n", with: "").replacingOccurrences(of: " ", with: "")
    }
}

private extension WKUserContentController {
    func addUserScripts(_ scripts: [WKUserScript]) {
        scripts.forEach {
            addUserScript($0)
        }
    }
}
