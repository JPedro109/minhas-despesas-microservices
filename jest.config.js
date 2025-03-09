module.exports = {
	roots: ["<rootDir>/tests"],
	testEnvironment: "node",
	collectCoverageFrom: [
		"<rootDir>/src/**",
	],
	moduleNameMapper: {
		"@/(.*)": "<rootDir>/src/$1",
	},
	transform: {
		".+\\.ts$": "ts-jest"
	},
	modulePathIgnorePatterns: [
		".*__mocks__.*"
	],
};