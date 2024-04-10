/**
 * @jest-environment jsdom
 */
/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js"

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeTruthy();
    });
  });

  // test d'intégration POST
  describe("When I am on NewBill Page, I fill the form and submit", () => {
    test("Then the bill is added to API POST", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const bill = {
        email: "employee@test.tld",
        type: "Hôtel et logement",
        name: "Hôtel du centre ville",
        amount: 120,
        date: "2022-12-30",
        vat: "10",
        pct: 10,
        commentary: "",
        fileUrl: "testFacture.png",
        fileName: "testFacture",
        status: "pending",
      };

      const typeField = screen.getByTestId("expense-type");
      fireEvent.change(typeField, { target: { value: bill.type } });
      expect(typeField.value).toBe(bill.type);
      const nameField = screen.getByTestId("expense-name");
      fireEvent.change(nameField, { target: { value: bill.name } });
      expect(nameField.value).toBe(bill.name);
      const dateField = screen.getByTestId("datepicker");
      fireEvent.change(dateField, { target: { value: bill.date } });
      expect(dateField.value).toBe(bill.date);
      const amountField = screen.getByTestId("amount");
      fireEvent.change(amountField, { target: { value: bill.amount } });
      expect(parseInt(amountField.value)).toBe(parseInt(bill.amount));
      const vatField = screen.getByTestId("vat");
      fireEvent.change(vatField, { target: { value: bill.vat } });
      expect(parseInt(vatField.value)).toBe(parseInt(bill.vat));
      const pctField = screen.getByTestId("pct");
      fireEvent.change(pctField, { target: { value: bill.pct } });
      expect(parseInt(pctField.value)).toBe(parseInt(bill.pct));
      const commentaryField = screen.getByTestId("commentary");
      fireEvent.change(commentaryField, { target: { value: bill.commentary } });
      expect(commentaryField.value).toBe(bill.commentary);

      const newBillForm = screen.getByTestId("form-new-bill");
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      newBillForm.addEventListener("change", handleChangeFile);
      const fileField = screen.getByTestId("file");
      fireEvent.change(fileField, {
        target: { files: [new File([bill.fileName], bill.fileUrl, { type: "image/png" })] },
      });
      expect(fileField.files[0].name).toBe(bill.fileUrl);
      expect(fileField.files[0].type).toBe("image/png");
      expect(handleChangeFile).toHaveBeenCalled();

      //handle error
      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        // Verifica si hay errores en el formulario
        const errorMessages = document.querySelectorAll(".error-message");
        expect(errorMessages.length).toBe(0); // No debería haber mensajes de error
      });
    });
    // Another proof of errors
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  });
});
