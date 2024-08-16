/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1E1E1E';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#494949',
    tabIconDefault: '#494949',
    tabIconSelected: tintColorLight,
    border: '#1E1E1E', 
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#FFFFFF',
    tabIconDefault: '#FFFFFF',
    tabIconSelected: tintColorDark,
    border: '#444', 
  },
};
