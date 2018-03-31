module.exports = {
	"parserOptions": {
		"ecmaVersion": 6
	},
	"env": {
		"browser": true,
		"jest": true
	},
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
