export const createShowcaseLaunchUrl = ({
  pageId,
  storyId,
  viewId = "charts"
}) => {
  const params = new URLSearchParams();

  if (storyId) {
    params.set("story", storyId);
    params.set("visual", "1");
  } else if (pageId) {
    if (viewId) {
      params.set("view", viewId);
    }
    params.set("page", pageId);
  } else {
    return "";
  }

  return `chartkitshowcase://showcase?${params.toString()}`;
};
