import { Label } from './labels';

export interface StatusUpdateRequestBody {
	action: string;
	actor: {
		email: string;
	};
	data: {
		description: string;
		id: string;
		identifier: string;
		state: {
			name: string;
		};
		labels: Label[];
	};
}
