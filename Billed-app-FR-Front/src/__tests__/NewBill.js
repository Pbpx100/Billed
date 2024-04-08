/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import store from '../__mocks__/store';
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)


describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill Page", () => {
    test("The button add check if the file have the correct extention", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const file = new File(["hello"], 'hello.png', { type: 'image/png' });

      await waitFor(() => screen.getByTestId('file'))
      const btnAddFile = screen.getByTestId('file')
      const typesFiles = "image/png"
      await waitFor(() =>
        fireEvent.change(btnAddFile, {
          target: { files: [file] },
        })
      );
      let image = screen.getByTestId("file");
      expect(image.files[0].type).toEqual(typesFiles);
    })
  })


  // test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I submit a new bill", () => {
      test('Then it should add the new bill ', async () => {
        const postSpy = jest.spyOn(store, 'bills');
        const bills = store.bills();
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(bills.update.length).toBe(1);
      });
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
      })
    })
  })
})

