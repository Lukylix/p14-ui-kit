import React, { useState } from "react";

import { ModalProvider, Modal } from "../../dist/esm/index.js";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Modal",
  component: Modal,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

export const Default = (args) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <ModalProvider>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <h1>Modal Content</h1>
      </Modal>
      <h2>Whitout ModalOpen Composant</h2>
      <p>Some random content</p>
      <button onClick={() => setIsVisible(true)}>Open Modal</button>
    </ModalProvider>
  );
};
