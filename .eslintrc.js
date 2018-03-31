module.exports = {
	"env": { "browser": true, "node": true },
	"extends": "eslint:recommended",
	"parserOptions": { "sourceType": "module", "ecmaVersion": 8 },
	"rules": {
		"arrow-parens": [
			"error",
			"always"
		],
		"padded-blocks": [
			"error",
			{
				"classes": "always"
			}
		],
		"no-console": 0,
		"class-methods-use-this": 0,
		"no-param-reassign": 0,
		"no-tabs": 0,
		"indent": [
			"error",
			"tab",
			{
				"SwitchCase": 1
			}
		]
	}
};
