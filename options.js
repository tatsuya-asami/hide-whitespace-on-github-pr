document.addEventListener("DOMContentLoaded", () => {
	const repoListElement = document.querySelector("#repo-list tbody");
	const addRepoButton = document.getElementById("add-repo");
	const enableAllCheckbox = document.getElementById("enable-all");

	// Load the repository list and apply "enable-all" setting
	const loadRepositories = () => {
		chrome.storage.local.get(
			["repositories", "applyToAll"],
			({ repositories = [], applyToAll = false }) => {
				repoListElement.innerHTML = "";

				// Set the state of the enable-all checkbox
				enableAllCheckbox.checked = applyToAll;

				// Sort repositories alphabetically by URL
				repositories.sort((a, b) => a.url.localeCompare(b.url));

				// Create table entries for each repository
				repositories.forEach((repoObj, index) => {
					createRepoEntry(repoObj, index, applyToAll);
				});
			},
		);
	};

	// Create a single row for a repository entry
	const createRepoEntry = (repoObj, index, applyToAll) => {
		const row = document.createElement("tr");

		// Apply opacity only if "enable-all" is checked
		if (applyToAll) {
			row.classList.add("inactive");
		} else if (!repoObj.enabled) {
			row.classList.add("inactive");
		}

		// Repository URL cell
		const urlCell = createRepoURLCell(repoObj, index);
		row.appendChild(urlCell);

		// State button cell
		const stateCell = createStateButtonCell(repoObj, index);
		row.appendChild(stateCell);

		// Delete button cell
		const deleteCell = createDeleteButtonCell(index);
		row.appendChild(deleteCell);

		repoListElement.appendChild(row);
	};

	// Create repository URL input field
	const createRepoURLCell = (repoObj, index) => {
		const urlCell = document.createElement("td");
		const urlInput = document.createElement("input");
		urlInput.type = "text";
		urlInput.value = repoObj.url;
		urlInput.placeholder = "owner/repo or owner/*";
		urlInput.addEventListener("change", () =>
			updateRepo(index, urlInput.value),
		);
		urlCell.appendChild(urlInput);
		return urlCell;
	};

	// Create state toggle button
	const createStateButtonCell = (repoObj, index) => {
		const stateCell = document.createElement("td");
		const stateButton = document.createElement("button");
		stateButton.textContent = repoObj.enabled ? "ACTIVE" : "INACTIVE";
		stateButton.className = repoObj.enabled
			? "active-button"
			: "inactive-button";
		stateButton.addEventListener("click", () => toggleState(index));
		stateCell.appendChild(stateButton);
		return stateCell;
	};

	// Create delete button
	const createDeleteButtonCell = (index) => {
		const deleteCell = document.createElement("td");
		const deleteButton = document.createElement("button");
		deleteButton.className = "delete-button";
		deleteButton.textContent = "X";
		deleteButton.addEventListener("click", () => deleteRepository(index));
		deleteCell.appendChild(deleteButton);
		return deleteCell;
	};

	// Toggle the state of a repository
	const toggleState = (index) => {
		chrome.storage.local.get("repositories", ({ repositories = [] }) => {
			const repo = repositories[index];
			repo.enabled = !repo.enabled; // Toggle enabled state
			chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
		});
	};

	// Delete a repository
	const deleteRepository = (index) => {
		chrome.storage.local.get("repositories", ({ repositories = [] }) => {
			repositories.splice(index, 1); // Remove the repository at the given index
			chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
		});
	};

	// Update the repository URL
	const updateRepo = (index, newUrl) => {
		chrome.storage.local.get("repositories", ({ repositories = [] }) => {
			const repo = repositories[index];
			repo.url = newUrl; // Update the repository URL
			chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
		});
	};

	// Add a new empty repository entry if there is no blank one
	addRepoButton.addEventListener("click", () => {
		chrome.storage.local.get("repositories", ({ repositories = [] }) => {
			const hasBlankField = repositories.some((repoObj) => repoObj.url === "");
			if (!hasBlankField) {
				repositories.push({ url: "", enabled: true });
				chrome.storage.local.set({ repositories }, loadRepositories); // Save and reload
			}
		});
	});

	// Apply "enable-all" state
	enableAllCheckbox.addEventListener("change", (event) => {
		const applyToAll = event.target.checked;
		chrome.storage.local.set({ applyToAll }, loadRepositories); // Save and reload
	});

	// Initial load of repositories
	loadRepositories();
});
