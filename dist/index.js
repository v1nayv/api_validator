"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sway_1 = __importDefault(require("sway"));
var ValidationCodes;
(function (ValidationCodes) {
    ValidationCodes["VERBS_USED"] = "VERBS_USED";
})(ValidationCodes || (ValidationCodes = {}));
var verbsInPathValidator = function (api) {
    var entry = {
        code: ValidationCodes.VERBS_USED,
        message: "Avoid verbs in the path names.",
        path: [],
    };
    var violatedWords = ["set", "create", "new", "delete", "remove"];
    api.getPaths().forEach(function (value) {
        violatedWords.forEach(function (word) {
            if (value.path.includes(word)) {
                entry.path.push(value.path);
            }
        });
    });
    var result = {
        errors: entry.path.length ? [entry] : [],
        warnings: [],
    };
    return result;
};
var args = process.argv;
sway_1.default.create({
    definition: args[args.length - 1],
    customValidators: [verbsInPathValidator],
}).then(function (apiDocumentation) {
    var validationResults = apiDocumentation.validate();
    validationResults.errors.forEach(function (errorObj) {
        console.error({ errorObj: errorObj });
    });
    if (validationResults.errors.length || validationResults.warnings.length) {
        process.exit(1);
    }
});
