
import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

type FillFormOptions = {
  form?: "login" | "register";
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export const fillForm = async (user: UserEvent, options: FillFormOptions = {}) => {
  const {
    form = "register",
    fullName = "Roshidh S",
    email = "roshidh@gmail.com",
    password = "Password@123",
    confirmPassword = password,
  } = options;

  if (form === "login") {
    await user.type(screen.getByPlaceholderText(/john@example.com/i), email);
    await user.type(screen.getByLabelText(/password/i), password);
    return;
  }

  await user.type(screen.getByPlaceholderText(/john doe/i), fullName);
  await user.type(screen.getByPlaceholderText(/john@gmail.com/i), email);
  await user.type(
    screen.getByLabelText(/password/i, { selector: "input#password" }),
    password
  );
  await user.type(
    screen.getByLabelText(/confirm password/i, {
      selector: "input#confirmPassword",
    }),
    confirmPassword
  );
};