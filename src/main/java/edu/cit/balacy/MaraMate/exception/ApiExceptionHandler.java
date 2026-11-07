package edu.cit.balacy.MaraMate.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/** Every error comes back as { "message": "...", "fieldErrors": { "field": "..." } }. */
@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<Map<String, Object>> handleApi(ApiException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("message", ex.getMessage());
		if (ex.getField() != null) {
			body.put("fieldErrors", Map.of(ex.getField(), ex.getMessage()));
		}
		return ResponseEntity.status(ex.getStatus()).body(body);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> fields = new LinkedHashMap<>();
		ex.getBindingResult().getFieldErrors()
				.forEach(e -> fields.putIfAbsent(e.getField(), e.getDefaultMessage()));
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("message", "Check the highlighted fields and try again.");
		body.put("fieldErrors", fields);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
