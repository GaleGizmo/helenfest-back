const Guest = require("./model");
const { sendTicketEmail } = require("../../services/email");
const { buildGuestDishesHtml } = require("../../services/responseForUser");

async function createGuest(req, res) {
  try {
    const { email, name, companionName, hasChild, dish } = req.body;

    if (!email || !name || typeof hasChild !== "boolean") {
      return res.status(400).json({
        message:
          "email, name y hasChild son obligatorios (hasChild debe ser booleano).",
      });
    }

    const guest = await Guest.create({
      email,
      name,
      companionName,
      hasChild,
      dish,
    });

    // En serverless (Vercel) hay que esperar al envío: tras responder, la función se congela.
    try {
      await sendTicketEmail(guest);
    } catch (mailError) {
      console.error(
        "Error al enviar el email de confirmación:",
        mailError.message,
      );
    }

    res.status(201).json(guest);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Ya existe un invitado registrado con ese email." });
    }
    res
      .status(500)
      .json({
        message: "Error al registrar al invitado.",
        error: error.message,
      });
  }
}

async function getGuests(req, res) {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los invitados.",
        error: error.message,
      });
  }
}

async function getGuestByEmail(req, res) {
  try {
    const guest = await Guest.findOne({
      email: req.params.email.toLowerCase(),
    });
    if (!guest) {
      return res
        .status(404)
        .json({ message: "No hay ningún invitado registrado con ese email." });
    }
    res.json(guest);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar al invitado.", error: error.message });
  }
}

async function deleteGuestByEmail(req, res) {
  try {
    const guest = await Guest.findOneAndDelete({
      email: req.params.email.toLowerCase(),
    });
    if (!guest) {
      return res
        .status(404)
        .json({ message: "No hay ningún invitado registrado con ese email." });
    }
    res.json({ message: "Invitado eliminado correctamente." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar al invitado.",
        error: error.message,
      });
  }
}

async function getAllDishesByUser(req, res) {
  try {
    const dishes = await Guest.find().select("name email dish -_id");
    const formattedDishes = dishes.map((dish) => ({
      "invitado": dish.name,
      "email": dish.email,
      "aportacion culinaria": dish.dish,
    }));
    res.send(buildGuestDishesHtml(formattedDishes));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los platos.", error: error.message });
  }
}

module.exports = {
  createGuest,
  getGuests,
  getGuestByEmail,
  deleteGuestByEmail,
  getAllDishesByUser,
};
