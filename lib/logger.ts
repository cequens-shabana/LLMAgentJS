import * as log from "https://deno.land/std/log/mod.ts";

const customFormatter = (logRecord: log.LogRecord): string => {
  const dateTime = new Date().toLocaleString();
  return `${dateTime} - ${logRecord.levelName} - ${logRecord.msg} : `;
};

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: customFormatter,
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const logger = log.getLogger();
