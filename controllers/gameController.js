import Game from "../model/Game.js";

export const getAvailableGames = async (req, res) => {
  // console.log(req.query);
  const { ageGroup, gender, token } = req.query;

  let query = {
    ageGroup,
    token: token ? Number(token) : { $in: [1, 2] },
  };

  let games = await Game.find(query);

  // gender-wise filtering
  games = games.filter((game) =>
    gender === "male" ? game.maleCount > 0 : game.femaleCount > 0
  );

  res.json(games);
};

// CREATE GAME
export const createGame = async (req, res) => {
  try {
    const { ageGroup, gameName, token, maleCount, femaleCount } = req.body;

    // Basic validation
    if (!ageGroup || !gameName || !token) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const game = await Game.create({
      ageGroup,
      gameName,
      token,
      maleCount,
      femaleCount,
    });

    res.status(201).json({
      message: "Game created successfully",
      game,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkCreateGames = async (req, res) => {
  try {
    const games = req.body;

    if (!Array.isArray(games) || games.length === 0) {
      return res.status(400).json({ message: "Games array required" });
    }

    await Game.insertMany(games);

    res.status(201).json({
      message: "All games inserted successfully",
      totalGames: games.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
