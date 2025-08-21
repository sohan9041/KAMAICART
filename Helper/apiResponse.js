// ✅ Generic Response Builder
function sendResponse(res, statusCode, type, msg, data = null, extra = {}) {
	return res.status(statusCode).json({
		status: type,
		message: msg,
		data,
		...extra,
	});
}

// ✅ Wrap all responses inside an object
const apiResponse = {
	mainResponse: function (res, type, msg, data = null) {
		let statusCode = 200;
		let responseType = "failed";

		switch (type) {
			case "success":
				statusCode = 200;
				responseType = "success";
				break;
			case "created":
				statusCode = 201;
				responseType = "success";
				break;
			case "no-content":
				statusCode = 204;
				responseType = "success";
				data = null;
				break;
			case "validation":
				statusCode = 400;
				break;
			case "unauthorized":
				statusCode = 401;
				break;
			case "forbidden":
				statusCode = 403;
				break;
			case "no-route":
				statusCode = 404;
				break;
			case "conflict":
				statusCode = 409;
				break;
			case "too-many-requests":
				statusCode = 429;
				break;
			case "bad-gateway":
				statusCode = 502;
				break;
			case "service-unavailable":
				statusCode = 503;
				break;
			case "gateway-timeout":
				statusCode = 504;
				break;
			default:
				statusCode = 500;
				msg = msg || "Internal Server Error";
		}

		return sendResponse(res, statusCode, responseType, msg, data);
	},

	// ✅ Success Responses
	successResponseWithData: (res, msg, data, extra = {}) =>
		sendResponse(res, 200, "success", msg, data, extra),

	createdResponse: (res, msg, data) =>
		sendResponse(res, 201, "success", msg, data),

	noContentResponse: (res, msg = "No Content") =>
		sendResponse(res, 204, "success", msg, null),

	// ✅ Error Responses
	ErrorResponse: (res, msg) =>
		sendResponse(res, 500, "failed", msg),

	notFoundResponse: (res, msg) =>
		sendResponse(res, 404, "failed", msg),

	validationErrorWithData: (res, msg, data) =>
		sendResponse(res, 400, "failed", msg, data),

	unauthorizedResponse: (res, msg) =>
		sendResponse(res, 401, "failed", msg),

	forbiddenResponse: (res, msg) =>
		sendResponse(res, 403, "failed", msg),

	conflictResponse: (res, msg) =>
		sendResponse(res, 409, "failed", msg),

	tooManyRequestsResponse: (res, msg) =>
		sendResponse(res, 429, "failed", msg),

	serviceUnavailableResponse: (res, msg) =>
		sendResponse(res, 503, "failed", msg),
};

// ✅ Export default
export default apiResponse;
