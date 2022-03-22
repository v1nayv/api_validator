import Sway, {
  DocumentValidationFunction,
  ValidationEntry,
  ValidationResults,
} from "sway";

enum ValidationCodes {
  VERBS_USED = "VERBS_USED",
}

const verbsInPathValidator: DocumentValidationFunction = (
  api: Sway.SwaggerApi
) => {
  const entry: ValidationEntry = {
    code: ValidationCodes.VERBS_USED,
    message: "Avoid verbs in the path names.",
    path: [],
  };

  const violatedWords: String[] = ["set", "create", "new", "delete", "remove"];

  api.getPaths().forEach((value) => {
    violatedWords.forEach((word: String) => {
      if (value.path.includes(word)) {
        entry.path.push(value.path);
      }
    });
  });

  const result: ValidationResults = {
    errors: entry.path.length ? [entry] : [],
    warnings: [],
  };

  return result;
};

const args = process.argv;

Sway.create({
  definition: args[args.length - 1],
  customValidators: [verbsInPathValidator],
}).then((apiDocumentation: Sway.SwaggerApi) => {
  const validationResults: ValidationResults = apiDocumentation.validate();
  validationResults.errors.forEach((errorObj) => {
    console.error({ errorObj });
  });

  if (validationResults.errors.length || validationResults.warnings.length) {
    process.exit(1);
  }
});
