**ggtype API Documentation v0.6.0**

***

# ggtype API Documentation v0.6.0

## Router

- [StreamMessageType](enumerations/StreamMessageType.md)
- [ActionCbParameters](interfaces/ActionCbParameters.md)
- [OnRequest](interfaces/OnRequest.md)
- [OnWebSocketMessage](interfaces/OnWebSocketMessage.md)
- [Router](interfaces/Router.md)
- [RouterBase](interfaces/RouterBase.md)
- [RouterCallOptions](interfaces/RouterCallOptions.md)
- [RouterOptions](interfaces/RouterOptions.md)
- [StreamMessage](interfaces/StreamMessage.md)
- [Action](type-aliases/Action.md)
- [ActionFn](type-aliases/ActionFn.md)
- [ClientActionsBase](type-aliases/ClientActionsBase.md)
- [InferRouter](type-aliases/InferRouter.md)
- [ParamsInfer](type-aliases/ParamsInfer.md)
- [ResultInfer](type-aliases/ResultInfer.md)
- [ReturnValue](type-aliases/ReturnValue.md)
- [RouterInfer](type-aliases/RouterInfer.md)
- [RouterInferNotGeneric](type-aliases/RouterInferNotGeneric.md)
- [RouterRawMessage](type-aliases/RouterRawMessage.md)
- [ServerActionsBase](type-aliases/ServerActionsBase.md)
- [action](functions/action.md)
- [createRouter](functions/createRouter.md)
- [getCtx](functions/getCtx.md)

## Client

- [BidirectionalConnection](interfaces/BidirectionalConnection.md)
- [ClientAction](interfaces/ClientAction.md)
- [ClientActionResult](interfaces/ClientActionResult.md)
- [DuplexOptions](interfaces/DuplexOptions.md)
- [FetchOptions](interfaces/FetchOptions.md)
- [RouterClient](interfaces/RouterClient.md)
- [RouterClientOptions](interfaces/RouterClientOptions.md)
- [WebsocketOptions](interfaces/WebsocketOptions.md)
- [ClientCallableActions](type-aliases/ClientCallableActions.md)
- [ClientCallableActionsFromClient](type-aliases/ClientCallableActionsFromClient.md)
- [ParamsIt](type-aliases/ParamsIt.md)
- [ResultFor](type-aliases/ResultFor.md)
- [ResultForWithActionResult](type-aliases/ResultForWithActionResult.md)
- [defineClientActionsSchema](functions/defineClientActionsSchema.md)

## Utils

- [ErrorWithCode](classes/ErrorWithCode.md)
- [ValidationError](classes/ValidationError.md)
- [ActionResultBase](interfaces/ActionResultBase.md)
- [ActionResultError](interfaces/ActionResultError.md)
- [ActionResultOk](interfaces/ActionResultOk.md)
- [ErrorBase](interfaces/ErrorBase.md)
- [OutputErrorGeneric](interfaces/OutputErrorGeneric.md)
- [OutputValidationError](interfaces/OutputValidationError.md)
- [RouterResultNotGeneric](interfaces/RouterResultNotGeneric.md)
- [ActionsParams](type-aliases/ActionsParams.md)
- [ActionsParamsNotGeneric](type-aliases/ActionsParamsNotGeneric.md)
- [ActionsResult](type-aliases/ActionsResult.md)
- [AppError](type-aliases/AppError.md)
- [Infer](type-aliases/Infer.md)
- [OutputError](type-aliases/OutputError.md)
- [ResultStatus](type-aliases/ResultStatus.md)
- [UnwrapStreamType](type-aliases/UnwrapStreamType.md)
- [compileModelAndCheck](functions/compileModelAndCheck.md)
- [handleError](functions/handleError.md)
- [isAsyncIterable](functions/isAsyncIterable.md)
- [isAsyncStream](functions/isAsyncStream.md)
- [isError](functions/isError.md)
- [isGenericError](functions/isGenericError.md)
- [isIterable](functions/isIterable.md)
- [isModel](functions/isModel.md)
- [isNumber](functions/isNumber.md)
- [isObject](functions/isObject.md)
- [isString](functions/isString.md)
- [isSuccess](functions/isSuccess.md)
- [isValidationError](functions/isValidationError.md)
- [NOOP\_CLIENT\_ACTIONS](functions/NOOP_CLIENT_ACTIONS.md)
- [NOOP\_ON\_ERROR](functions/NOOP_ON_ERROR.md)
- [DEFAULT\_ROUTER\_TIMEOUT](variables/DEFAULT_ROUTER_TIMEOUT.md)

## Functions

- [createRouterClient](functions/createRouterClient.md)
- [hasStreamData](functions/hasStreamData.md)
- [isStream](functions/isStream.md)

## Namespaces

- [m](ggtype-API-Documentation/namespaces/m/README.md)

## Type Aliases

- [ActionResult](type-aliases/ActionResult.md)
- [DuplexActionsProxyType](type-aliases/DuplexActionsProxyType.md)
- [FetchActionsProxyType](type-aliases/FetchActionsProxyType.md)
- [StreamActionsProxyType](type-aliases/StreamActionsProxyType.md)
- [ValidationResult](type-aliases/ValidationResult.md)

## Variables

- [AJV](variables/AJV.md)
- [UPLOAD\_FILE](variables/UPLOAD_FILE.md)
