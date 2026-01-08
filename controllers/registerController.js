import Participant from "../model/Participant.js";
import Game from "../model/Game.js";

// export const registerParticipant = async (req, res) => {
//   const { participantData, selectedGames } = req.body;

//   // Parse selectedGames if it's a string (FormData sends it as string)
//   if (typeof selectedGames === "string") {
//     selectedGames = JSON.parse(selectedGames);
//   }

//   const gender = participantData.gender;

//   try {
//     // 1️⃣ Generate OMJ human-readable ID
//     const count = await Participant.countDocuments();
//     const newIdNumber = count + 1;
//     const participantId = `OMJ-SPORT-${String(newIdNumber).padStart(4, "0")}`;

//     // 2️⃣ Reduce game counts & fetch game names
//     const gamesWithName = [];

//     for (let g of selectedGames) {
//       const update =
//         gender === "male"
//           ? { $inc: { maleCount: -1 } }
//           : { $inc: { femaleCount: -1 } };

//       const game = await Game.findOneAndUpdate(
//         {
//           _id: g.gameId,
//           ...(gender === "male"
//             ? { maleCount: { $gt: 0 } }
//             : { femaleCount: { $gt: 0 } }),
//         },
//         update,
//         { new: true }
//       );

//       if (!game) {
//         return res.status(400).json({ message: `Game ${g.gameId} is full` });
//       }

//       gamesWithName.push({
//         gameId: game._id,
//         gameName: game.gameName,
//         token: game.token,
//       });
//     }
//     // 3️⃣ Save participant with populated games
//     const participant = new Participant({
//       participantId,
//       ...participantData,
//       gamesSelected: gamesWithName,
//       paymentScreenshot: req.file
//         ? { url: req.file.path, publicId: req.file.filename }
//         : undefined,
//       paymentStatus: "pending",
//     });
//     await participant.save();

//     // 4️⃣ Send clean response
//     res.status(201).json({
//       message: "Registration Successful",
//       participant: {
//         participantId,
//         name: participant.name,
//         fatherName: participant.fatherName,
//         khundi: participant.khundi,
//         dob: participant.dob,
//         gender: participant.gender,
//         omjCard: participant.omjCard,
//         cnic: participant.cnic,
//         whatsapp: participant.whatsapp,
//         location: participant.location,
//         kitSize: participant.kitSize,
//         ageGroup: participant.ageGroup,
//         gamesSelected: gamesWithName, // clean games with gameName
//         paymentScreenshot: participant.paymentScreenshot,
//         paymentStatus: participant.paymentStatus,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const registerParticipant = async (req, res) => {
  try {
    let { participantData, selectedGames } = req.body;

    // Parse selectedGames if it's a string (FormData sends it as string)
    if (typeof selectedGames === "string") {
      selectedGames = JSON.parse(selectedGames);
    }

    const gender = participantData.gender;

    // 1️⃣ Generate OMJ human-readable ID
    const count = await Participant.countDocuments();
    const newIdNumber = count + 1;
    const participantId = `OMJ-SPORT-${String(newIdNumber).padStart(4, "0")}`;

    // 2️⃣ Reduce game counts & fetch game names
    const gamesWithName = [];

    for (let g of selectedGames) {
      const update =
        gender === "male"
          ? { $inc: { maleCount: -1 } }
          : { $inc: { femaleCount: -1 } };

      const game = await Game.findOneAndUpdate(
        {
          _id: g.gameId,
          ...(gender === "male"
            ? { maleCount: { $gt: 0 } }
            : { femaleCount: { $gt: 0 } }),
        },
        update,
        { new: true }
      );

      if (!game) {
        return res.status(400).json({ message: `Game ${g.gameId} is full` });
      }

      gamesWithName.push({
        gameId: game._id,
        gameName: game.gameName,
        token: game.token,
      });
    }

    // 3️⃣ Save participant
    const participant = new Participant({
      participantId,
      ...participantData,
      gamesSelected: gamesWithName,
      paymentScreenshot: req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : undefined,
      paymentStatus: "pending",
    });
    await participant.save();

    // 4️⃣ Send response
    res.status(201).json({
      message: "Registration Successful",
      participant: {
        participantId,
        ...participantData,
        gamesSelected: gamesWithName,
        paymentScreenshot: participant.paymentScreenshot,
        paymentStatus: participant.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllParticipants = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, gameName } = req.query;

    let query = {};

    // 1️⃣ Search across multiple fields
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { participantId: regex },
        { name: regex },
        { fatherName: regex },
        { khundi: regex },
        { ageGroup: regex },
        { omjCard: regex },
        { cnic: regex },
        { whatsapp: regex },
        { location: regex },
      ];
    }

    // 2️⃣ Game filter
    if (gameName && gameName.trim().length > 0) {
      query["gamesSelected.gameName"] = {
        $regex: new RegExp(gameName.trim(), "i"),
      };
    }

    // 3️⃣ Pagination
    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const totalRecords = await Participant.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageLimit);

    const participants = await Participant.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 4️⃣ Clean response
    const data = participants.map((p) => ({
      id: p._id,
      participantId: p.participantId,
      name: p.name,
      fatherName: p.fatherName,
      khundi: p.khundi,
      dob: p.dob,
      gender: p.gender,
      omjCard: p.omjCard,
      cnic: p.cnic,
      whatsapp: p.whatsapp,
      location: p.location,
      kitSize: p.kitSize,
      ageGroup: p.ageGroup,
      gamesSelected: p.gamesSelected.map((g) => ({
        gameId: g.gameId,
        gameName: g.gameName,
        token: g.token,
      })),
      paymentScreenshot: p.paymentScreenshot,
      paymentStatus: p.paymentStatus,
    }));

    res.status(200).json({
      pagination: {
        totalRecords,
        totalPages,
        currentPage,
        limit: pageLimit,
      },
      participants: data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const statusPaymentUpdate = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { paymentStatus } = req.body; // "paid" | "pending" | "rejected"

    // ✅ validation
    if (!paymentStatus) {
      return res.status(400).json({
        status: false,
        message: "Payment status is required",
      });
    }

    const participant = await Participant.findOneAndUpdate(
      { participantId },
      { paymentStatus },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({
        status: false,
        message: "Participant not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Payment status updated successfully",
      data: {
        participantId: participant.participantId,
        paymentStatus: participant.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
