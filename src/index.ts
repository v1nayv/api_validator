import Sway, {
  DocumentValidationFunction,
  Operation,
  Path,
  Response,
  ValidationEntry,
  ValidationResults,
} from "sway";

enum ValidationCodes {
  VERBS_USED = "VERBS_USED",
  CONSIDER_201_STATUS_CODE = "CONSIDER_201_STATUS_CODE",
  CONSIDER_204_STATUS_CODE = "CONSIDER_204_STATUS_CODE",
}

const apiValidator: DocumentValidationFunction = (api: Sway.SwaggerApi) => {
  const result: ValidationResults = {
    errors: [],
    warnings: [],
  };

  api.getPaths().forEach((value) => {
    let verbValidationEntry = identifyPathWithVerbs(value.path);
    if (verbValidationEntry) {
      result.errors.push(verbValidationEntry);
    }
    let postStatusCodeValidations = identifyPostStatusCodes(value);
    if (postStatusCodeValidations.length) {
      result.errors.push(postStatusCodeValidations);
    }
  });

  return result;
};

const identifyPostStatusCodes = (path: any) => {
  let result: ValidationEntry[] = [];
  path.getOperations().forEach((operation: any) => {
    if (operation.method == "post") {
      let response = operation.getResponses().find((response: any) => {
        return response.statusCode === "200";
      });

      if (response) {
        let postResponseCode: ValidationEntry = {
          code: ValidationCodes.CONSIDER_201_STATUS_CODE,
          message: "Consider using 201 status code for POST",
          path: [path.path, operation.method, response.statusCode],
        };

        result.push(postResponseCode);
      }
    }
  });

  return result;
};

const identifyPathWithVerbs = (path: string) => {
  const violatedWords: string[] = [
    "set",
    "create",
    "new",
    "delete",
    "remove",
    "patch",
    "update",
  ];

  const verbValidationEntry: ValidationEntry = {
    code: ValidationCodes.VERBS_USED,
    message: "Avoid verbs in the path names.",
    path: [],
  };

  violatedWords.forEach((word: string) => {
    if (path.includes(word)) {
      verbValidationEntry.path.push(path);
    }
  });

  return verbValidationEntry.path.length ? verbValidationEntry : null;
};

const args = process.argv;

Sway.create({
  definition:
    args.length === 3 ? args[2] : "http://localhost:3000/api/swagger.json",
  customValidators: [apiValidator],
}).then((apiDocumentation: Sway.SwaggerApi) => {
  const validationResults: ValidationResults = apiDocumentation.validate();
  validationResults.errors.forEach((errorObj) => {
    console.error(JSON.stringify(errorObj));
  });

  if (validationResults.errors.length || validationResults.warnings.length) {
    process.exit(1);
  }
});
