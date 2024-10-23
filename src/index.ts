import { StatusUpdateRequestBody } from './models/status-update';
import { LinearClient, LinearFetch, User } from '@linear/sdk';
import { createHmac } from 'node:crypto';
import { Label } from './models/labels';

function doesReleaseNoteExists(description: string): boolean {
	const releaseNoteRegex = /\*Release Note:\*\n\n```\n([\s\S]*?)\n```/;
	const releaseNoteMatch = description.match(releaseNoteRegex);
	if (releaseNoteMatch && releaseNoteMatch[1].trim() !== '') {
		return true;
	} else {
		return false;
	}
}

async function doesReleaseNoteLabelExists(webhookLabelList: Label[]): Promise<boolean> {
	const releaseNoteLabelId = '1ca89fa7-7b81-49cc-8a4d-c527692c4ec5';
	return await doesLabelsExists(webhookLabelList, [releaseNoteLabelId]);
}

async function doesLabelsExists(webhookLabelList: Label[], labelsIdList: string[]): Promise<boolean> {
	// console.log('Checking if release note label exists.');
	let allIdsExist = false;
	allIdsExist = labelsIdList.every((id) => webhookLabelList.some((label) => label.id === id));
	return allIdsExist;
}

async function commentAndSetStatusOfIssue(issueIdentifier: string, issueId: string, linearClient: LinearClient, env: any) {
	// console.log('Commenting and setting status of ' + issueIdentifier);

	const inProgressId = '2ff59d04-e926-4aec-b3af-575f562f1ec6';

	const issue = await linearClient.issue(issueId);
	issue.update({ stateId: inProgressId });

	const commentPayload = await linearClient.createComment({
		issueId: issueId,
		body: 'Please update the issue content to include the release note, add the `release_note` label and change the status back to "Ready for Review." Thank you!',
	});
	if (commentPayload.success) {
		return commentPayload.comment;
	} else {
		return new Error('Failed to create comment');
	}
}

export default {
	async fetch(request, env: any, ctx): Promise<Response> {
		if (request.method != 'POST') {
			return new Response('Only POST requests are allowed', { status: 400 });
		}

		const linearClient = new LinearClient({
			apiKey: env.LINEAR_API_KEY,
		});

		const requestBodyText = await request.text();

		// // Verify signature
		// const signature = createHmac('sha256', env.LINEAR_WEBHOOK_SIGN).update(requestBodyText).digest('hex');
		// if (signature !== request.headers.get('linear-signature')) {
		// 	return new Response('Signature error.', { status: 403 });
		// }

		let requestBody = JSON.parse(requestBodyText);
		let serializedRequestBody: StatusUpdateRequestBody = {
			action: requestBody.action,
			actor: {
				email: requestBody.actor.email,
			},
			data: {
				description: requestBody.data.description,
				id: requestBody.data.id,
				identifier: requestBody.data.identifier,
				state: {
					name: requestBody.data.state.name,
				},
				labels: requestBody.data.labels,
			},
		};

		const userEmail = env.LINEAR_EMAIL_FILTER;
		console.log('userEmail: ', userEmail);

		if (serializedRequestBody.actor.email != userEmail) {
			console.log('Actor is not ', userEmail, ' Skipping.');
			return new Response();
		} else if (serializedRequestBody.data.state.name != 'Ready To Review') {
			console.log("State is not 'Ready to Review'. Skipping.");
			return new Response();
		}

		// console.log(serializedRequestBody);

		const doesReleaseNoteExistsResult = doesReleaseNoteExists(serializedRequestBody.data.description);
		const doesReleaseNoteLabelExistsResult = await doesReleaseNoteLabelExists(serializedRequestBody.data.labels);

		// console.log('doesReleaseNoteExistsResult: ', doesReleaseNoteExistsResult);
		// console.log('doesReleaseNoteLabelExistsResult: ', doesReleaseNoteLabelExistsResult);

		if (doesReleaseNoteExistsResult && doesReleaseNoteLabelExistsResult) {
			return new Response('Release note and label exists, nice work!');
		} else {
			await commentAndSetStatusOfIssue(serializedRequestBody.data.identifier, serializedRequestBody.data.id, linearClient, env);
			return new Response('Comment added successfully!');
		}

		// return new Response();
	},
} satisfies ExportedHandler<Env>;
