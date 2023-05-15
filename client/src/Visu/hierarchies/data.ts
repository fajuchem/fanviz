export const data = {
  name: "getFromDB",
  value: 0,
  children: [
    {
      name: "getUsers",
      value: 100,
      children: [
        {
          name: "GetActiveUsers",
          value: 100,
        },
        {
          name: "GetInactiveUsers",
          value: 300,
        },
        {
          name: "GetUsersByAge",
          value: 200,
        },
        {
          name: "GetUsersByGender",
          value: 200,
        },
      ],
    },
    {
      name: "GetMovies",
      value: 200,
      children: [
        {
          name: "GetMoviesByGenre",
          value: 200,
        },
      ],
    },
    {
      name: "GetRatings",
      value: 200,
    },
    {
      name: "GetReviews",
      value: 200,
    },
  ],
};
