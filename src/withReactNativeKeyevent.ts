import { ConfigPlugin, withMainActivity } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

const withAndroidMainActivityImport: ConfigPlugin = (config: any) => {
  console.log("[KeyEventPlugin] Running import injection...");
  return withMainActivity(config, (config) => {
    const src = config.modResults.contents;

    const importLines = [
      "import android.view.KeyEvent",
      "import com.github.kevinejohn.keyevent.KeyEventModule",
    ];

    const result = mergeContents({
      tag: "react-native-keyevent-imports",
      src,
      newSrc: importLines.join("\n"),
      anchor: "import android.os.Bundle",
      offset: 1,
      comment: "//",
    });

    config.modResults.contents = result.contents;
    return config;
  });
};

const withAndroidMainActivityBody: ConfigPlugin = (config: any) => {
  console.log("[KeyEventPlugin] Running method injection...");
  return withMainActivity(config, (config) => {
    const src = config.modResults.contents;

    const isKotlin = /class MainActivity\s*:\s*ReactActivity\(\)/.test(src);
    const isJava = /public class MainActivity\s+extends\s+ReactActivity\s*\{/.test(src);

    console.log(">> [KeyEventPlugin] Detected language:", isKotlin ? "Kotlin" : isJava ? "Java" : "Unknown");

    if (!isKotlin && !isJava) {
      throw new Error("MainActivity does not appear to be a recognizable Java or Kotlin ReactActivity.");
    }

    const anchor = isKotlin
      ? /override\s*fun\s*onCreate\s*\(\s*savedInstanceState\s*:\s*Bundle\?\s*\)\s*\{/
      : /public\s+class\s+MainActivity\s+extends\s+ReactActivity\s*\{/;

    console.log(">> [KeyEventPlugin] Looking for anchor:", anchor.toString());

    const newSrc = [
      isKotlin ? "    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {" : "@Override\npublic boolean onKeyDown(int keyCode, KeyEvent event) {",
      "        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);",
      isKotlin ? "        return super.onKeyDown(keyCode, event)" : "        super.onKeyDown(keyCode, event);",
      isKotlin ? "    }" : "        return true;\n    }",
      "",
      isKotlin ? "    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {" : "@Override\npublic boolean onKeyUp(int keyCode, KeyEvent event) {",
      "        KeyEventModule.getInstance().onKeyUpEvent(keyCode, event);",
      isKotlin ? "        return super.onKeyUp(keyCode, event)" : "        super.onKeyUp(keyCode, event);",
      isKotlin ? "    }" : "        return true;\n    }",
      "",
      isKotlin ? "    override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {" : "@Override\npublic boolean onKeyMultiple(int keyCode, int repeatCount, KeyEvent event) {",
      "        KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event);",
      isKotlin ? "        return super.onKeyMultiple(keyCode, repeatCount, event)" : "        return super.onKeyMultiple(keyCode, repeatCount, event);",
      isKotlin ? "    }" : "    }",
    ];

    const result = mergeContents({
      tag: "react-native-keyevent-body",
      src,
      newSrc: newSrc.join("\n"),
      anchor,
      offset: 1,
      comment: "//",
    });

    config.modResults.contents = result.contents;
    return config;
  });
};

const withKeyEventPlugin: ConfigPlugin = (config) => {
  console.log("[KeyEventPlugin] Starting plugin...");
  config = withAndroidMainActivityImport(config);
  config = withAndroidMainActivityBody(config);
  console.log(">> [KeyEventPlugin] Plugin finished.");
  return config;
};

export default withKeyEventPlugin;
