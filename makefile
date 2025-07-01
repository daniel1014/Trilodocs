# Makefile for TriloDocs project

# --- Variables ---
PYTHON_ENV = .venv
BACKEND_DIR = backend
FRONTEND_DIR = frontend

# --- Targets ---

# Default target: show help
.PHONY: help
help:
	@echo "TriloDocs Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  setup-backend    : Set up backend virtual environment and install dependencies."
	@echo "  run-backend      : Run the backend FastAPI server."
	@echo "  setup-frontend   : Navigate to frontend, install dependencies with --legacy-peer-deps."
	@echo "  run-frontend     : Run the frontend Next.js development server (local backend)."
	@echo "  run-frontend-prod: Run the frontend Next.js development server (production backend)."
	@echo "  build-frontend   : Build the frontend Next.js project for production."
	@echo "  setup-all        : Run both backend and frontend setup."
	@echo "  run-all          : Run both backend and frontend servers concurrently (requires splitting terminal)."
	@echo "  clean-backend    : Remove backend virtual environment."
	@echo "  clean-frontend   : Remove frontend node_modules."
	@echo "  clean-next       : Remove the frontend Next.js build directory."
	@echo "  clean-all        : Clean both backend and frontend build artifacts."

# --- Backend Targets ---

.PHONY: setup-backend
setup-backend: $(BACKEND_DIR)/$(PYTHON_ENV)/bin/activate
	@echo "Backend setup complete."

# Rule to create and activate the virtual environment and install dependencies
$(BACKEND_DIR)/$(PYTHON_ENV)/bin/activate: $(BACKEND_DIR)/requirements.txt
	@echo "Setting up backend virtual environment..."
	@cd $(BACKEND_DIR) && python3 -m venv $(PYTHON_ENV)
	@echo "Activating backend virtual environment and installing dependencies..."
	@. $(BACKEND_DIR)/$(PYTHON_ENV)/bin/activate && pip install -r $(BACKEND_DIR)/requirements.txt
	@touch $(BACKEND_DIR)/$(PYTHON_ENV)/bin/activate # Create the file to mark as done

.PHONY: run-backend
run-backend: $(BACKEND_DIR)/$(PYTHON_ENV)/bin/activate
	@echo "Running backend server..."
	@cd $(BACKEND_DIR) && . $(PYTHON_ENV)/bin/activate && uvicorn main:app --reload --port 8000

# --- Frontend Targets ---

.PHONY: setup-frontend
setup-frontend:
	@echo "Setting up frontend dependencies..."
	@cd $(FRONTEND_DIR) && npm install --legacy-peer-deps
	@echo "Frontend setup complete."

.PHONY: run-frontend
run-frontend:
	@echo "Running frontend server with local backend..."
	@cd $(FRONTEND_DIR) && npm run dev

.PHONY: run-frontend-prod
run-frontend-prod:
	@echo "Running frontend server with production backend..."
	@cd $(FRONTEND_DIR) && npm run dev:prod

.PHONY: build-frontend
build-frontend:
	@echo "Building frontend Next.js project..."
	@cd $(FRONTEND_DIR) && npm run build
	@echo "Frontend build complete."

# --- Combined Targets ---

.PHONY: setup-all
setup-all: setup-backend setup-frontend
	@echo "Full setup complete for both backend and frontend."

.PHONY: run-all
run-all:
	@echo "Starting backend and frontend servers."
	@echo "Backend server will run in one process, frontend in another."
	@echo "You may need to split your terminal or open new tabs."
	@echo "Starting backend..."
	@make run-backend &
	@echo "Starting frontend..."
	@make run-frontend

# --- Clean Targets ---

.PHONY: clean-backend
clean-backend:
	@echo "Cleaning backend virtual environment..."
	@rm -rf $(BACKEND_DIR)/$(PYTHON_ENV)

.PHONY: clean-frontend
clean-frontend:
	@echo "Cleaning frontend node_modules..."
	@rm -rf $(FRONTEND_DIR)/node_modules

.PHONY: clean-next
clean-next:
	@echo "Cleaning frontend Next.js build directory (.next)..."
	@rm -rf $(FRONTEND_DIR)/.next

.PHONY: clean-all
clean-all: clean-backend clean-frontend clean-next
	@echo "Cleaned backend virtual environment and frontend build artifacts."
