document.addEventListener("DOMContentLoaded", () => {
	const repoListElement = document.querySelector("#repo-list tbody");
	const addRepoButton = document.getElementById("add-repo");

	// Set constants
	const DEFAULT_REPO = { url: "", enabled: true };

	// Load repository list from chrome.storage
	const loadRepositories = () => {
		chrome.storage.local.get("repositories", (data) => {
			const repositories = data.repositories || [];
			renderRepositories(repositories);
		});
	};

	// Display repositories
	const renderRepositories = (repositories) => {
		repoListElement.innerHTML = ""; // Clear existing rows
		repositories.forEach((repoObj, index) => createRepoEntry(repoObj, index));
	};

	// Create repository entry
	const createRepoEntry = (repoObj, index) => {
		const row = document.createElement("tr");
		if (!repoObj.enabled) row.classList.add("inactive");

		const urlCell = createUrlCell(repoObj.url, index);
		const stateCell = createStateCell(repoObj.enabled, index);
		const deleteCell = createDeleteCell(index);

		row.append(urlCell, stateCell, deleteCell);
		repoListElement.appendChild(row);
	};

	// Create URL input cell
	const createUrlCell = (url, index) => {
		const urlCell = document.createElement("td");
		const urlInput = document.createElement("input");

		urlInput.type = "text";
		urlInput.value = url;
		urlInput.placeholder = "owner/repo or owner/*";

		urlInput.addEventListener("change", () => {
			updateRepo(index, urlInput.value);
		});

		urlCell.appendChild(urlInput);
		return urlCell;
	};

	// Create status cell
	const createStateCell = (enabled, index) => {
		const stateCell = document.createElement("td");
		const stateButton = document.createElement("button");

		stateButton.textContent = enabled ? "ACTIVE" : "INACTIVE";
		stateButton.className = enabled ? "active-button" : "inactive-button";

		stateButton.addEventListener("click", () => {
			toggleState(index);
		});

		stateCell.appendChild(stateButton);
		return stateCell;
	};

	// Create delete button
	const createDeleteCell = (index) => {
		const deleteCell = document.createElement("td");
		const deleteButton = document.createElement("button");

		deleteButton.className = "delete-button";
		deleteButton.textContent = "X";

		deleteButton.addEventListener("click", () => {
			deleteRepository(index);
		});

		deleteCell.appendChild(deleteButton);
		return deleteCell;
	};

	// Toggle repository state
	const toggleState = (index) => {
		chrome.storage.local.get("repositories", (data) => {
			const repositories = data.repositories || [];
			const repo = repositories[index];
			repo.enabled = !repo.enabled; // Toggle state
			chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
		});
	};

	// Delete repository
	const deleteRepository = (index) => {
		chrome.storage.local.get("repositories", (data) => {
			const repositories = data.repositories || [];
			repositories.splice(index, 1); // Delete repository at specified index
			chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
		});
	};

	// Update repository URL
	const updateRepo = (index, newUrl) => {
		chrome.storage.local.get("repositories", (data) => {
			const repositories = data.repositories || [];
			const repo = repositories[index];
			if (repo) {
				repo.url = newUrl; // Update repository URL
				repositories.sort((a, b) => a.url.localeCompare(b.url));
				chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
			}
		});
	};

	// Add empty repository entry
	addRepoButton.addEventListener("click", () => {
		chrome.storage.local.get("repositories", (data) => {
			const repositories = data.repositories || [];
			const hasBlankField = repositories.some((repoObj) => repoObj.url === "");

			if (!hasBlankField) {
				repositories.unshift(DEFAULT_REPO); // Add empty repository
				chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
			}
		});
	});

	// Load initial repositories
	loadRepositories();
});
