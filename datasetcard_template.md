# Correct syntax examples:
{{ page.title }}
{% if condition %}content{% endif %}
{{ variable | filter:parameter }}

# Incorrect syntax that could cause this error:
{{ variable | filter:param1:param2 }}  // too many parameters
{% if condition %}content{% endif  // missing closing %} 