exports.slugGenerator = (name, id = "") => {
    if (name != null) {
      let slug = name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
      if (id !== "") {
        slug = slug + "-" + id;
      }
      return slug;
    }
  };