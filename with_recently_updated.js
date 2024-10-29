(() => {
  const addQueryParam = () => {
    const prPageRegex = /^https:\/\/github.com\/([^\/]+)\/([^\/]+)\/pulls/;
    const match = window.location.href.match(prPageRegex);
    if (!match) {
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("sort")) {
      return;
    }

    const ownerRepo = `${match[1]}/${match[2]}`;
    try {
      chrome.storage.local.get(["repositories", "applyToAll"], (result) => {
        const repos = result.repositories || [];
        const applyToAll = result.applyToAll || false;

        if (
          applyToAll ||
          repos
            .filter((repo) => repo.enabled)
            .filter((repo) => repo.url.match(/.+\/.+/))
            .some((repo) => ownerRepo.match(new RegExp(repo.url)))
        ) {
          url.searchParams.append("sort", "updated-desc");
          history.replaceState(null, "", url.toString());
          window.location.href = url.toString();
        }
      });
    } catch (e) {
      console.error("Extension context invalidated: ", e);
      // Retry after some delay if the context is invalid
      setTimeout(addQueryParam, 500); // Retry after 500ms
    }
  };

  // Initial check when the script runs
  addQueryParam();

  // Create a MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        // Recheck the URL whenever the child list of the body changes
        addQueryParam();
      }
    }
  });
  // Start observing the body for child list changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
