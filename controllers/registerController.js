import Participant from "../model/Participant.js";
import Game from "../model/Game.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";

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
    const { search, page = 1, limit = 10, gameName, paymentStatus } = req.query;

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

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
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
    const { id } = req.params;
    const { paymentStatus } = req.body;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid participant id",
      });
    }

    const allowedStatus = ["paid", "pending", "rejected"];
    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({
        status: false,
        message: "Invalid payment status",
      });
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
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
        id: participant._id,
        participantId: participant.participantId, // still return readable id
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

export const getParticipantStats = async (req, res) => {
  try {
    // 1️⃣ Overall gender wise count
    const genderStats = await Participant.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = {
      all: 0,
      male: 0,
      female: 0,
    };

    genderStats.forEach((g) => {
      total[g._id] = g.count;
      total.all += g.count;
    });

    // 2️⃣ Age group + Gender wise count
    const stats = await Participant.aggregate([
      {
        $group: {
          _id: {
            ageGroup: "$ageGroup",
            gender: "$gender",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const ageGroups = {};

    stats.forEach((item) => {
      const { ageGroup, gender } = item._id;

      if (!ageGroups[ageGroup]) {
        ageGroups[ageGroup] = {
          total: 0,
          male: 0,
          female: 0,
        };
      }

      ageGroups[ageGroup][gender] = item.count;
      ageGroups[ageGroup].total += item.count;
    });

    // 3️⃣ Response
    res.status(200).json({
      total,
      ageGroups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportParticipantsExcel = async (req, res) => {
  try {
    const { paymentStatus, search } = req.query;

    let query = {};
    if (paymentStatus && paymentStatus !== "all")
      query.paymentStatus = paymentStatus;
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { participantId: regex },
        { whatsapp: regex },
        { cnic: regex },
      ];
    }

    const participants = await Participant.find(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participants");

    // Columns
    worksheet.columns = [
      { header: "Participant ID", key: "participantId", width: 20 },
      { header: "Name", key: "name", width: 20 },
      { header: "Father Name", key: "fatherName", width: 20 },
      { header: "CNIC", key: "cnic", width: 20 },
      { header: "WhatsApp", key: "whatsapp", width: 20 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Age Group", key: "ageGroup", width: 10 },
      { header: "Kit Size", key: "kitSize", width: 10 },
      { header: "Khundi", key: "khundi", width: 15 },
      { header: "Location", key: "location", width: 15 },
      { header: "Games", key: "games", width: 30 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Payment Screenshot", key: "paymentScreenshot", width: 50 },
    ];

    // Add Rows
    participants.forEach((p) => {
      worksheet.addRow({
        participantId: p.participantId || "",
        name: p.name || "",
        fatherName: p.fatherName || "",
        cnic: p.cnic || "",
        whatsapp: p.whatsapp || "",
        gender: p.gender || "",
        ageGroup: p.ageGroup || "",
        kitSize: p.kitSize || "",
        khundi: p.khundi || "",
        location: p.location || "",
        games: p.gamesSelected?.map((g) => g.gameName).join(", ") || "",
        paymentStatus: p.paymentStatus || "",
        paymentScreenshot: p.paymentScreenshot?.url || "",
      });
    });

    // Header styling
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    // Send file properly
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=participants}.xlsx`
    );

    // Correct way: write workbook to buffer first
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateParticipantBasicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, whatsapp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid participant id",
      });
    }

    // Optional validation
    if (!name || !fatherName || !whatsapp) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const updatedParticipant = await Participant.findByIdAndUpdate(
      id,
      {
        name,
        fatherName,
        whatsapp,
      },
      { new: true }
    );

    if (!updatedParticipant) {
      return res.status(404).json({
        status: false,
        message: "Participant not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Participant basic info updated successfully",
      data: updatedParticipant,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
