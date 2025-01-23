"use client";

import analyzeImage from "@/utils/cloud-vision";

const Home = () => {
	return (
		<>
			Hello
			<button onClick={analyzeImage}>CHECK</button>
		</>
	);
};

export default Home;
