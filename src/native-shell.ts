import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function prepareNativeShell() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await Promise.allSettled([
    StatusBar.setStyle({ style: Style.Dark }),
    StatusBar.setBackgroundColor({ color: "#090b10" }),
    SplashScreen.hide(),
  ]);
}
