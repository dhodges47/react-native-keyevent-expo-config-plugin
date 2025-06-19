"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
// 🔧 Helper to strip plugin-injected code blocks before reinjecting
function stripGeneratedBlocks(src) {
    return src.replace(/\/\/ @generated begin react-native-keyevent-[\s\S]*?\/\/ @generated end react-native-keyevent-[^\n]*\n?/g, '');
}
const withAndroidMainActivityImport = (config) => {
    return (0, config_plugins_1.withMainActivity)(config, (config) => {
        const src = config.modResults.contents;
        console.log(">> [KeyEventPlugin] Running import injection...");
        const importLines = [
            'import android.view.KeyEvent',
            'import com.github.kevinejohn.keyevent.KeyEventModule',
        ];
        const result = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-imports',
            src: stripGeneratedBlocks(src), // ✅ strip only right before merge
            newSrc: importLines.join('\n'),
            anchor: 'import android.os.Bundle',
            offset: 1,
            comment: '//',
        });
        if (!result.didMerge) {
            console.warn(">> [KeyEventPlugin] Import injection failed. Anchor not found or already injected.");
        }
        else {
            console.log(">> [KeyEventPlugin] Import lines injected.");
        }
        config.modResults.contents = result.contents;
        return config;
    });
};
const withAndroidMainActivityBody = (config) => {
    return (0, config_plugins_1.withMainActivity)(config, (config) => {
        const originalSrc = config.modResults.contents;
        console.log(">> [KeyEventPlugin] Running method injection...");
        const isKotlin = /class MainActivity\s*:\s*ReactActivity\(\)/.test(originalSrc);
        const isJava = /public class MainActivity\s+extends\s+ReactActivity\s*{/.test(originalSrc);
        if (!isKotlin && !isJava) {
            console.warn(">> [KeyEventPlugin] Could not detect MainActivity language (Java/Kotlin)");
            throw new Error("MainActivity does not appear to be a recognizable Java or Kotlin ReactActivity.");
        }
        const language = isKotlin ? 'Kotlin' : 'Java';
        console.log(`>> [KeyEventPlugin] Detected language: ${language}`);
        const anchor = isKotlin
            ? 'override fun onCreate(savedInstanceState: Bundle?) {'
            : 'public class MainActivity extends ReactActivity {';
        const src = stripGeneratedBlocks(originalSrc); // ✅ strip after detecting anchor
        const newSrc = [
            isKotlin ? '    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {' : '@Override\npublic boolean onKeyDown(int keyCode, KeyEvent event) {',
            '        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);',
            isKotlin ? '        return super.onKeyDown(keyCode, event)' : '        super.onKeyDown(keyCode, event);',
            isKotlin ? '    }' : '        return true;\n    }',
            '',
            isKotlin ? '    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {' : '@Override\npublic boolean onKeyUp(int keyCode, KeyEvent event) {',
            '        KeyEventModule.getInstance().onKeyUpEvent(keyCode, event);',
            isKotlin ? '        return super.onKeyUp(keyCode, event)' : '        super.onKeyUp(keyCode, event);',
            isKotlin ? '    }' : '        return true;\n    }',
            '',
            isKotlin ? '    override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {' : '@Override\npublic boolean onKeyMultiple(int keyCode, int repeatCount, KeyEvent event) {',
            '        KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event);',
            isKotlin ? '        return super.onKeyMultiple(keyCode, repeatCount, event)' : '        return super.onKeyMultiple(keyCode, repeatCount, event);',
            isKotlin ? '    }' : '    }',
        ];
        console.log(">> [KeyEventPlugin] Injecting after anchor:", anchor);
        console.log(">> [KeyEventPlugin] Injecting code:\n" + newSrc.join('\n'));
        const result = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-body',
            src,
            newSrc: newSrc.join('\n'),
            anchor,
            offset: 1,
            comment: '//',
        });
        if (!result.didMerge) {
            console.warn(">> [KeyEventPlugin] Method injection failed. Anchor not found or already injected.");
        }
        else {
            console.log(">> [KeyEventPlugin] Method block injected.");
        }
        config.modResults.contents = result.contents;
        return config;
    });
};
const withKeyEventPlugin = (config) => {
    console.log(">> [KeyEventPlugin] Starting plugin...");
    config = withAndroidMainActivityImport(config);
    config = withAndroidMainActivityBody(config);
    console.log(">> [KeyEventPlugin] Plugin finished.");
    return config;
};
exports.default = withKeyEventPlugin;
