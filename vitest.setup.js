import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "./src/i18n/index.js";

// globals:false olduğundan otomatik cleanup yok; her testten sonra DOM'u temizle.
afterEach(() => cleanup());
