import * as shell from "shelljs";

shell.cp("-R", "env", "dist/src/");
// shell.cp("-R", "report_temp", "dist/report_temp");
shell.cp("-R", "src/certs", "dist/src/");
shell.cp("-R", "logs", "dist");
// shell.cp("-R", "src/config/ssl/server.*", "dist/src/config/ssl/");