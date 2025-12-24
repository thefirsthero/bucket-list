type AppConfigType = {
  name: string;
  github: {
    title: string;
    url: string;
  };
  author: {
    name: string;
    url: string;
  };
};

export const appConfig: AppConfigType = {
  name: import.meta.env.VITE_APP_NAME ?? "Bucket List",
  github: {
    title: "Bucket List",
    url: "https://github.com",
  },
  author: {
    name: "You",
    url: "https://github.com/thefirsthero/",
  },
};

export const baseUrl = import.meta.env.VITE_BASE_URL ?? "";
