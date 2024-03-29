import { userSession } from "../user-session"
import { FormEvent, useCallback, useContext, useMemo } from "react"
import FunctionList from "./FunctionList"
import { SearchParams, useSearchValue } from "../hooks/useSearchParams"
import { ContractFn } from "../util/stacks-types"
import Input from "./ui/Input"
import { CallFn } from "./CallFn"
import { useContractData } from "../hooks/useContractData"

function ContractCallVote() {
  const { updateUrl } = useContext(SearchParams)
  const [contractName] = useSearchValue("contract-name")

  const { data } = useContractData(contractName)
  const [fnName, setFnName] = useSearchValue("fn-name")
  const selectedFn = useMemo(
    () => (data?.functions as ContractFn[])?.find((fn) => fn.name === fnName),
    [fnName, data?.functions],
  )

  const getContract = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      updateUrl({
        "contract-name": (e.currentTarget[0] as HTMLInputElement).value,
      })
    },
    [updateUrl],
  )

  const handleSelectFn = useCallback(
    (fn: ContractFn) => {
      setFnName(fn.name)
    },
    [setFnName],
  )

  if (!userSession.isUserSignedIn()) {
    return null
  }

  return (
    <div>
      <form onSubmit={getContract}>
        <label className="flex flex-col gap-y-4 my-12" htmlFor="contract-name">
          Gimme contract name
          <Input
            defaultValue={contractName}
            name="contract-name"
            placeholder="Contract name"
            type="text"
          />
        </label>
        <button className="Vote" type="submit">
          Get contract
        </button>
      </form>

      {data ? (
        <>
          <div className="mt-12">
            <FunctionList data={data} onSelect={handleSelectFn} />
          </div>
          <div className="mt-12">
            {selectedFn ? (
              <CallFn contractName={contractName} fn={selectedFn} />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default ContractCallVote
