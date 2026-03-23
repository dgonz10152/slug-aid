export default function FoodLabel({ label }: { label: string }) {
	// Function to add breaks for words longer than 10 characters and at the beginning of numbers
	const addBreaks = (text: string) => {
		return text
			.split(" ")
			.map((word) => {
				if (word.length > 10) {
					// First, add soft breaks before numbers
					let processedWord = word.replace(/(\d+)/g, "\u200B$1");
					// Then, insert a soft break every 10 characters
					processedWord = processedWord
						.replace(/(.{10})/g, "$1\u200B")
						.replace(/\u200B$/, "");
					return processedWord;
				}
				return word;
			})
			.join(" ");
	};

	return (
		<div className="text-slugSecondaryBlue font-semibold text-2xl  p-2 py-4 rounded-md text-center flex items-center justify-center shadow-md">
			<p className="break-words">{addBreaks(label)}</p>
		</div>
	);
}
