chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		chrome.storage.local.set({ applyToAll: true });
		chrome.runtime.openOptionsPage();
	}
});

chrome.action.onClicked.addListener(() => {
	chrome.runtime.openOptionsPage();
});
