import type { Preview } from "@storybook/react-native-web-vite";

import "./preview.css";

const preview: Preview = {
  parameters: {
    actions: {
      disable: true
    },
    controls: {
      disable: true
    },
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Charts"]
      }
    }
  },
  tags: ["visual-test"]
};

export default preview;
