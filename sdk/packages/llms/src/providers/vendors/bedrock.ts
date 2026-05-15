import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import type { GatewayResolvedProviderConfig } from "@cline/shared";
import { resolveApiKey } from "../http";
import type { ProviderFactoryResult } from "./types";

type BedrockCredentialProvider = () => PromiseLike<{
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
}>;

function withTemporaryAwsRegion<R>(
	region: string | undefined,
	fn: () => Promise<R>,
): Promise<R> {
	if (!region) return fn();

	const previousAwsRegion = process.env.AWS_REGION;
	process.env.AWS_REGION = region;

	return fn().finally(() => {
		if (previousAwsRegion === undefined) {
			delete process.env.AWS_REGION;
		} else {
			process.env.AWS_REGION = previousAwsRegion;
		}
	});
}

function createCredentialProvider(
	config: GatewayResolvedProviderConfig,
): BedrockCredentialProvider | undefined {
	const configuredProvider = config.options?.credentialProvider;
	if (typeof configuredProvider === "function") {
		return configuredProvider as BedrockCredentialProvider;
	}

	const authentication = config.options?.authentication;
	const profile =
		typeof config.options?.profile === "string"
			? config.options.profile.trim()
			: undefined;

	if (authentication !== "profile" && !profile) {
		return undefined;
	}

	const providerChain = fromNodeProviderChain({
		ignoreCache: true,
		...(profile ? { profile } : {}),
	});
	const region =
		typeof config.options?.region === "string"
			? config.options.region.trim()
			: undefined;

	return () => withTemporaryAwsRegion(region, () => providerChain());
}

export async function createBedrockProviderModule(
	config: GatewayResolvedProviderConfig,
): Promise<ProviderFactoryResult> {
	const credentialProvider = createCredentialProvider(config);

	const provider = createAmazonBedrock({
		region: config.options?.region as string | undefined,
		apiKey: await resolveApiKey(config),
		accessKeyId: config.options?.accessKeyId as string | undefined,
		secretAccessKey: config.options?.secretAccessKey as string | undefined,
		sessionToken: config.options?.sessionToken as string | undefined,
		baseURL: config.baseUrl,
		headers: config.headers,
		fetch: config.fetch,
		credentialProvider,
	});

	return {
		model: (modelId) => provider(modelId),
	};
}
